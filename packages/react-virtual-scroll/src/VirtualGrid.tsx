import React from "react";
import { Fragment } from "react";
import { ItemOffsetMapping, getRangeToRender, VirtualBaseItemProps, VirtualBaseProps, 
  VirtualInnerComponent, VirtualOuterComponent, ScrollEvent } from './VirtualBase';
import { useVirtualScroll, ScrollState } from './useVirtualScroll';
import { useIsScrolling as useIsScrollingHook} from './useIsScrolling';

export interface VirtualGridItemProps extends VirtualBaseItemProps {
  rowIndex: number,
  columnIndex: number,
}

type VirtualGridItem = React.ComponentType<VirtualGridItemProps>;

export interface VirtualGridProps extends VirtualBaseProps {
  children: VirtualGridItem,
  rowCount: number,
  rowOffsetMapping: ItemOffsetMapping,
  columnCount: number,
  columnOffsetMapping: ItemOffsetMapping,
  itemKey?: (rowIndex: number, columnIndex: number, data: any) => any,
  onScroll?: (rowOffset: number, columnOffset: number, newRowScrollState: ScrollState, newColumnScrollState: ScrollState) => void;
  outerComponent?: VirtualOuterComponent;
  innerComponent?: VirtualInnerComponent;
}

export interface VirtualGridProxy {
  scrollTo(rowOffset: number, columnOffset: number): void;
  scrollToItem(rowIndex: number, columnIndex: number): void;
}

const defaultItemKey = (rowIndex: number, columnIndex: number, _data: any) => `${rowIndex}:${columnIndex}`;

// Using a named function rather than => so that the name shows up in React Developer Tools
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
