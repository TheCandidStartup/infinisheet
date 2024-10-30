import React from "react";
import { ItemOffsetMapping, VirtualBaseProps, ScrollToOption } from './VirtualBase';
import { DisplayGrid, DisplayGridItem } from './DisplayGrid';
import { VirtualContainerRender } from './VirtualContainer';
import { VirtualScroll, VirtualScrollProxy } from './VirtualScroll';
import { AutoSizer } from './AutoSizer';
import { ScrollState } from './useVirtualScroll';

/**
 * Props accepted by {@link VirtualGrid}
 */
export interface VirtualGridProps extends VirtualBaseProps {
  /** Component used as a template to render items in the grid. Must implement {@link DisplayGridItem} interface. */
  children: DisplayGridItem,

  /** Number of rows in the grid */
  rowCount: number,

  /** 
   * Implementation of {@link ItemOffsetMapping} interface that defines size and offset to each row in the grid
   * 
   * Use {@link useFixedSizeItemOffsetMapping} or {@link useVariableSizeItemOffsetMapping} to create implementations
   * for common cases.
   */
  rowOffsetMapping: ItemOffsetMapping,

  /** Number of columns in the grid */
  columnCount: number,

  /** 
   * Implementation of {@link ItemOffsetMapping} interface that defines size and offset to each column in the grid
   * 
   * Use {@link useFixedSizeItemOffsetMapping} or {@link useVariableSizeItemOffsetMapping} to create implementations
   * for common cases.
   */
  columnOffsetMapping: ItemOffsetMapping,

  /**
   * Function that defines the key to use for each item given row and column index and value of {@link VirtualBaseProps.itemData}.
   * @defaultValue
   * ```ts
   * (rowIndex, columnIndex, _data) => `${rowIndex}:${columnIndex}`
   * ```
   */
  itemKey?: (rowIndex: number, columnIndex: number, data: unknown) => React.Key,

  /**
   * Callback after a scroll event has been processed and state updated but before rendering
   * @param rowOffset - Resulting overall row offset. Can be passed to {@link ItemOffsetMapping} to determine first row.
   * @param columnOffset - Resulting overall column offset. Can be passed to {@link ItemOffsetMapping} to determine first column.
   * @param newRowScrollState - New {@link ScrollState} for rows that will be used for rendering.
   * @param newColumnScrollState - New {@link ScrollState} for columns that will be used for rendering.
   */
  onScroll?: (rowOffset: number, columnOffset: number, newRowScrollState: ScrollState, newColumnScrollState: ScrollState) => void;

  /** Render prop implementing {@link VirtualContainerRender}. Used to customize {@link VirtualGrid} outer container. */
  outerRender?: VirtualContainerRender;

  /** Render prop implementing {@link VirtualContainerRender}. Used to customize {@link DisplayGrid} within {@link VirtualGrid} inner container. */
  innerRender?: VirtualContainerRender;
}

/**
 * Custom ref handle returned by {@link VirtualGrid} that exposes imperative methods
 * 
 * Use `React.useRef<VirtualGridProxy>(null)` to create a ref.
 */
export interface VirtualGridProxy {
  /**
   * Scrolls the list to the specified row and column in pixels
   */
  scrollTo(rowOffset?: number, columnOffset?: number): void;

  /**
   * Scrolls the list so that the specified item is visible
   * @param rowIndex - Row of item to scroll to
   * @param columnIndex - Column of item to scroll to
   * @param option - Where to {@link ScrollToOption | position} the item within the viewport
   */
  scrollToItem(rowIndex?: number, columnIndex?: number, option?: ScrollToOption): void;

  /** Exposes DOM clientWidth property */
  get clientWidth(): number;

  /** Exposes DOM clientHeight property */
  get clientHeight(): number;
}

function getRangeToScroll(index: number | undefined, mapping: ItemOffsetMapping) {
  if (index === undefined)
    return [undefined, undefined];

  return [mapping.itemOffset(index), mapping.itemSize(index)];
}

// Using a named function rather than => so that the name shows up in React Developer Tools
/**
 * Virtual Scrolling Grid
 * 
 * Accepts props defined by {@link VirtualGridProps}. 
 * Refs are forwarded to {@link VirtualGridProxy}. 
 * You must pass a single instance of {@link DisplayGridItem} as a child.
 * @group Components
 */
export const VirtualGrid = React.forwardRef<VirtualGridProxy, VirtualGridProps>(function VirtualGrid(props, ref) {
  const { rowCount, rowOffsetMapping, columnCount, columnOffsetMapping, children, 
    innerClassName, innerRender, itemData, itemKey, onScroll: onScrollCallback, ...scrollProps } = props;

  // Total size is same as offset to item one off the end
  const totalRowSize = rowOffsetMapping.itemOffset(rowCount);
  const totalColumnSize = columnOffsetMapping.itemOffset(columnCount);

  const [state, setState] = React.useState<[number,number]>([0,0]);
  const scrollRef = React.useRef<VirtualScrollProxy>(null);


  React.useImperativeHandle(ref, () => {
    return {
      scrollTo(rowOffset?: number, columnOffset?: number): void {
        const scroll = scrollRef.current;
        /* istanbul ignore else */
        if (scroll)
          scroll.scrollTo(rowOffset, columnOffset);
      },

      scrollToItem(rowIndex?: number, columnIndex?: number, option?: ScrollToOption): void {
        const scroll = scrollRef.current;
        /* istanbul ignore if */
        if (!scroll)
          return;

        const [rowOffset, rowSize] = getRangeToScroll(rowIndex, rowOffsetMapping);
        const [colOffset, colSize] = getRangeToScroll(columnIndex, columnOffsetMapping);

        scroll.scrollToArea(rowOffset, rowSize, colOffset, colSize, option);
      },

      get clientWidth(): number {
        return scrollRef.current ? scrollRef.current.clientWidth : /* istanbul ignore next */ 0;
      },

      get clientHeight(): number {
        return scrollRef.current ? scrollRef.current.clientHeight : /* istanbul ignore next */ 0;
      }
    }
  }, [ rowOffsetMapping, columnOffsetMapping ]);


  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do. 
  const ChildVar = children;

  return (
    <VirtualScroll
      ref={scrollRef}
      {...scrollProps}
      scrollHeight={totalRowSize}
      scrollWidth={totalColumnSize}
      onScroll={(verticalOffset, horizontalOffset, verticalScrollState, horizontalScrollState) => {
        setState([verticalOffset, horizontalOffset]);
        if (onScrollCallback)
          onScrollCallback(verticalOffset, horizontalOffset, verticalScrollState, horizontalScrollState);
      }}>
      {({ isScrolling }) => (
        <AutoSizer style={{ height: '100%', width: '100%' }}>
        {({height,width}) => (
          <DisplayGrid
            innerClassName={innerClassName}
            innerRender={innerRender}
            rowOffset={state[0]}
            columnOffset={state[1]}
            height={height}
            rowCount={rowCount}
            columnCount={columnCount}
            itemData={itemData}
            itemKey={itemKey}
            isScrolling={isScrolling}
            rowOffsetMapping={rowOffsetMapping}
            columnOffsetMapping={columnOffsetMapping}
            width={width}>
            {ChildVar}
        </DisplayGrid>
      )}
      </AutoSizer>
      )}
    </VirtualScroll>
  );
});

export default VirtualGrid;
