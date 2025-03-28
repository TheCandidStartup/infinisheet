import React from "react";
import type { ItemOffsetMapping } from "@candidstartup/infinisheet-types";
import { VirtualBaseProps, ScrollToOption } from './VirtualBase';
import { DisplayGrid, DisplayGridItem, GridItemKey } from './DisplayGrid';
import { VirtualContainerRender } from './VirtualContainer';
import { VirtualScroll } from './VirtualScroll';
import { VirtualScrollProxy } from './VirtualScrollProxy';
import { virtualGridScrollToItem, VirtualGridProxy } from './VirtualGridProxy';
import { AutoSizer } from './AutoSizer';
import { ScrollState } from './useVirtualScroll';

/**
 * Callback after a scroll event has been processed and state updated but before rendering
 * @param rowOffset - Resulting overall row offset. Can be passed to {@link ItemOffsetMapping} to determine first row.
 * @param columnOffset - Resulting overall column offset. Can be passed to {@link ItemOffsetMapping} to determine first column.
 * @param newRowScrollState - New {@link ScrollState} for rows that will be used for rendering.
 * @param newColumnScrollState - New {@link ScrollState} for columns that will be used for rendering.
 */
export type VirtualGridScrollHandler = (rowOffset: number, columnOffset: number, 
  newRowScrollState: ScrollState, newColumnScrollState: ScrollState) => void;

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
   * Function implementing {@link GridItemKey} that defines the key to use for each item.
   * @defaultValue `(rowIndex, columnIndex, _data) => '${rowIndex}:${columnIndex}'`
   */
  itemKey?: GridItemKey | undefined,

  /** Scroll handler implementing {@link VirtualGridScrollHandler} called after a scroll event has been processed and state updated. */
  onScroll?: VirtualGridScrollHandler | undefined;

  /** Render prop implementing {@link VirtualContainerRender}. Used to customize {@link VirtualGrid} outer container. */
  outerRender?: VirtualContainerRender | undefined;

  /** Render prop implementing {@link VirtualContainerRender}. Used to customize {@link DisplayGrid} within {@link VirtualGrid} inner container. */
  innerRender?: VirtualContainerRender | undefined;
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
        virtualGridScrollToItem(scrollRef, rowOffsetMapping, columnOffsetMapping, rowIndex, columnIndex, option);
      },

      get clientWidth(): number {
        return scrollRef.current ? scrollRef.current.clientWidth : /* istanbul ignore next */ 0;
      },

      get clientHeight(): number {
        return scrollRef.current ? scrollRef.current.clientHeight : /* istanbul ignore next */ 0;
      },

      get verticalOffset(): number {
        return scrollRef.current ? scrollRef.current.verticalOffset : /* istanbul ignore next */ 0;
      },

      get horizontalOffset(): number {
        return scrollRef.current ? scrollRef.current.horizontalOffset : /* istanbul ignore next */ 0;
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
        if (onScrollCallback)
          onScrollCallback(verticalOffset, horizontalOffset, verticalScrollState, horizontalScrollState);
      }}>
      {({ isScrolling, verticalOffset, horizontalOffset }) => (
        <AutoSizer style={{ height: '100%', width: '100%' }}>
        {({height,width}) => (
          <DisplayGrid
            innerClassName={innerClassName}
            innerRender={innerRender}
            rowOffset={verticalOffset}
            columnOffset={horizontalOffset}
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
