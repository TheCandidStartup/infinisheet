import React from "react";
import { Fragment } from "react";
import { ItemOffsetMapping,  VirtualBaseItemProps, VirtualBaseProps, 
  VirtualInnerComponent, VirtualOuterComponent, ScrollEvent } from './VirtualBase';
import { getRangeToRender } from './VirtualCommon';
import { useVirtualScroll, ScrollState } from './useVirtualScroll';
import { useIsScrolling as useIsScrollingHook} from './useIsScrolling';

/**
 * Props accepted by {@link VirtualGridItem}
 */
export interface VirtualGridItemProps extends VirtualBaseItemProps {
  /** Row index of item in the grid being rendered */
  rowIndex: number,

  /** Column index of item in the grid being rendered */
  columnIndex: number,
}

/**
 * Type of item in a {@link VirtualGrid}
 *
 * Must be passed as a child to {@link VirtualGrid}. 
 * Accepts props defined by {@link VirtualGridItemProps}.
 * Component must pass {@link VirtualBaseItemProps.style} to whatever it renders. 
 * 
 * @example Basic implementation
 * ```
 * const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
 *   <div className="cell" style={style}>
 *     { `${rowIndex}:${columnIndex}` }
 *   </div>
 * );
 * ```
 */
export type VirtualGridItem = React.ComponentType<VirtualGridItemProps>;

/**
 * Props accepted by {@link VirtualGrid}
 */
export interface VirtualGridProps extends VirtualBaseProps {
  /** Component used as a template to render items in the grid. Must implement {@link VirtualGridItem} interface. */
  children: VirtualGridItem,

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

  /** Component implementing {@link VirtualOuterComponent}. Used to customize {@link VirtualGrid}. */
  outerComponent?: VirtualOuterComponent;

  /** Component implementing {@link VirtualInnerComponent}. Used to customize {@link VirtualGrid}. */
  innerComponent?: VirtualInnerComponent;
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
  scrollTo(rowOffset: number, columnOffset: number): void;

  /**
   * Scrolls the list so that the specified item is visible
   * @param rowIndex - Row of item to scroll to
   * @param columnIndex - Column of item to scroll to
   */
  scrollToItem(rowIndex: number, columnIndex: number): void;
}

const defaultItemKey = (rowIndex: number, columnIndex: number, _data: unknown) => `${rowIndex}:${columnIndex}`;

// Using a named function rather than => so that the name shows up in React Developer Tools
/**
 * Virtual Scrolling Grid
 * 
 * Accepts props defined by {@link VirtualGridProps}. 
 * Refs are forwarded to {@link VirtualGridProxy}. 
 * You must pass a single instance of {@link VirtualGridItem} as a child.
 * @group Components
 */
export const VirtualGrid = React.forwardRef<VirtualGridProxy, VirtualGridProps>(function VirtualGrid(props, ref) {
  const { width, height, rowCount, rowOffsetMapping, columnCount, columnOffsetMapping, children, className, innerClassName, 
    itemData = undefined, itemKey = defaultItemKey, onScroll: onScrollCallback, useIsScrolling = false } = props;

  // Total size is same as offset to item one off the end
  const totalRowSize = rowOffsetMapping.itemOffset(rowCount);
  const totalColumnSize = columnOffsetMapping.itemOffset(columnCount);

  const outerRef = React.useRef<HTMLDivElement>(null);
  const { scrollOffset: scrollRowOffset, renderOffset: renderRowOffset, renderSize: renderRowSize,
    onScroll: onScrollRow, doScrollTo: doScrollToRow } = useVirtualScroll(totalRowSize, props.maxCssSize, props.minNumPages);
  const { scrollOffset: scrollColumnOffset, renderOffset: renderColumnOffset, renderSize: renderColumnSize,
    onScroll: onScrollColumn, doScrollTo: doScrollToColumn} = useVirtualScroll(totalColumnSize, props.maxCssSize, props.minNumPages);
  const isScrolling = useIsScrollingHook(outerRef); 

  React.useImperativeHandle(ref, () => {
    return {
      scrollTo(rowOffset: number, columnOffset: number): void {
        const outer = outerRef.current;
        /* istanbul ignore else */
        if (outer)
          outer.scrollTo(doScrollToColumn(columnOffset, outer.clientWidth), doScrollToRow(rowOffset, outer.clientHeight));
      },

      scrollToItem(rowIndex: number, columnIndex: number): void {
        this.scrollTo(rowOffsetMapping.itemOffset(rowIndex), columnOffsetMapping.itemOffset(columnIndex));
      }
    }
  }, [ rowOffsetMapping, columnOffsetMapping, doScrollToRow, doScrollToColumn ]);


  function onScroll(event: ScrollEvent) {
    const { clientWidth, clientHeight, scrollWidth, scrollHeight, scrollLeft, scrollTop } = event.currentTarget;
    const [newScrollTop, newRowScrollState] = onScrollRow(clientHeight, scrollHeight, scrollTop);
    const [newScrollLeft, newColumnScrollState] = onScrollColumn(clientWidth, scrollWidth, scrollLeft);
    if (outerRef.current && (newScrollTop != scrollTop || newScrollLeft != scrollLeft ))
      outerRef.current.scrollTo(newScrollLeft, newScrollTop);
    onScrollCallback?.(newRowScrollState.scrollOffset+newRowScrollState.renderOffset, 
      newColumnScrollState.scrollOffset+newColumnScrollState.renderOffset, newRowScrollState, newColumnScrollState);
  }

  const [startRowIndex, startRowOffset, rowSizes] = 
    getRangeToRender(rowCount, rowOffsetMapping, height, scrollRowOffset + renderRowOffset);
  const [startColumnIndex, startColumnOffset, columnSizes] = 
    getRangeToRender(columnCount, columnOffsetMapping, width, scrollColumnOffset + renderColumnOffset);

  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do. 
  const ChildVar = children;
  const Outer = props.outerComponent || 'div';
  const Inner = props.innerComponent || 'div';

  // Being far too clever. Implementing a complex iteration in JSX in a map expression by abusing the comma operator. 
  // You can't declare local variables in an expression so they need to be hoisted out of the JSX. The comma operator
  // returns the result of the final statement which makes the iteration a little clumsier.
  let nextRowOffset = startRowOffset - renderRowOffset;
  let rowIndex=0, rowOffset=0;
  let nextColumnOffset=0, columnIndex=0, columnOffset=0;

  return (
    <Outer className={className} onScroll={onScroll} ref={outerRef} 
        style={{ position: "relative", height, width, overflow: "auto", willChange: "transform" }}>
      <Inner className={innerClassName} style={{ height: renderRowSize, width: renderColumnSize }}>
        {rowSizes.map((rowSize, rowArrayIndex) => (
          rowOffset = nextRowOffset,
          nextRowOffset += rowSize,
          rowIndex = startRowIndex + rowArrayIndex,
          nextColumnOffset = startColumnOffset - renderColumnOffset,
          <Fragment key={itemKey(rowIndex, 0, itemData)}>
          {columnSizes.map((columnSize, columnArrayIndex) => (
            columnOffset = nextColumnOffset,
            nextColumnOffset += columnSize,
            columnIndex = startColumnIndex + columnArrayIndex,
            <ChildVar data={itemData} key={itemKey(rowIndex, columnIndex, itemData)}
                      rowIndex={rowIndex} columnIndex={columnIndex}
                      isScrolling={useIsScrolling ? isScrolling : undefined}
                      style={{ position: "absolute", top: rowOffset, height: rowSize, left: columnOffset, width: columnSize }}/>
          ))}
          </Fragment>
        ))}
      </Inner>
    </Outer>
  );
});

export default VirtualGrid;
