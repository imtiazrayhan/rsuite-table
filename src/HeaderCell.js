// @flow

import * as React from 'react';
import classNames from 'classnames';

import Cell from './Cell';
import ColumnResizeHandler from './ColumnResizeHandler';
import { isNullOrUndefined, getUnhandledProps, defaultClassPrefix, prefix } from './utils';

type Props = {
  width?: number,
  dataKey?: string,
  left?: number,
  className?: string,
  classPrefix?: string,
  headerHeight?: number,
  children?: React.Node,

  // self props
  index?: number,
  sortColumn?: string,
  sortType: 'desc' | 'asc',
  sortable?: boolean,
  resizable?: boolean,
  onColumnResizeStart?: (columnWidth?: number, left?: number, fixed?: boolean) => void,
  onColumnResizeEnd?: (
    columnWidth?: number,
    cursorDelta?: number,
    dataKey?: any,
    index?: number
  ) => void,
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: boolean) => void,
  onSortColumn?: Function,
  flexGrow?: number,
  fixed?: boolean
};

type State = {
  initialEvent?: Object,
  columnWidth?: number
};

class HeaderCell extends React.Component<Props, State> {
  static defaultProps = {
    classPrefix: defaultClassPrefix('table-cell-header'),
    sortType: 'asc'
  };
  constructor(props: Props) {
    super(props);
    this.state = {
      columnWidth: isNullOrUndefined(props.flexGrow) ? props.width : 0
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.width !== nextProps.width || this.props.flexGrow !== nextProps.flexGrow) {
      this.setState({
        columnWidth: isNullOrUndefined(nextProps.flexGrow) ? nextProps.width : 0
      });
    }
  }
  handleColumnResizeStart = (event: any) => {
    const { left, fixed, onColumnResizeStart } = this.props;

    this.setState({ initialEvent: event });
    onColumnResizeStart && onColumnResizeStart(this.state.columnWidth, left, fixed);
  };

  handleColumnResizeEnd = (columnWidth?: number, cursorDelta?: number) => {
    const { dataKey, index, onColumnResizeEnd } = this.props;
    this.setState({ columnWidth });
    onColumnResizeEnd && onColumnResizeEnd(columnWidth, cursorDelta, dataKey, index);
  };

  handleClick = () => {
    const { sortable, dataKey, sortType, onSortColumn } = this.props;
    sortable && onSortColumn && onSortColumn(dataKey, sortType === 'asc' ? 'desc' : 'asc');
  };

  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  renderResizeSpanner() {
    const { resizable, left, onColumnResizeMove, fixed, headerHeight } = this.props;
    const { columnWidth, initialEvent } = this.state;

    if (!resizable) {
      return null;
    }

    return (
      <ColumnResizeHandler
        columnWidth={columnWidth}
        columnLeft={left}
        columnFixed={fixed}
        height={headerHeight ? headerHeight - 1 : undefined}
        initialEvent={initialEvent}
        onColumnResizeMove={onColumnResizeMove}
        onColumnResizeStart={this.handleColumnResizeStart}
        onColumnResizeEnd={this.handleColumnResizeEnd}
      />
    );
  }

  renderSortColumn() {
    const { sortable, sortColumn, sortType, dataKey } = this.props;

    if (sortable) {
      const iconClasses = classNames(this.addPrefix('icon-sort'), {
        [this.addPrefix(`icon-sort-${sortType}`)]: sortColumn === dataKey
      });
      return (
        <span className={this.addPrefix('sort-wrapper')}>
          <i className={iconClasses} />
        </span>
      );
    }
    return null;
  }

  render() {
    const {
      className,
      width,
      dataKey,
      headerHeight,
      children,
      left,
      sortable,
      classPrefix,
      ...rest
    } = this.props;
    const classes = classNames(classPrefix, className, {
      [this.addPrefix('sortable')]: sortable
    });
    const unhandled = getUnhandledProps(HeaderCell, rest);

    return (
      <div className={classes}>
        <Cell
          {...unhandled}
          width={width}
          dataKey={dataKey}
          left={left}
          headerHeight={headerHeight}
          isHeaderCell={true}
          onClick={this.handleClick}
        >
          {children}
          {this.renderSortColumn()}
        </Cell>

        {this.renderResizeSpanner()}
      </div>
    );
  }
}

export default HeaderCell;
