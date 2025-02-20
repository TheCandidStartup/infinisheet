import type { ItemOffsetMapping } from "@candidstartup/infinisheet-types";
import { ScrollToOption } from './VirtualBase';
import { VirtualScrollProxy } from './VirtualScrollProxy';

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

  /** Current vertical position of scroll bar */
  get verticalOffset(): number;

  /** Current horizontal position of scroll bar */
  get horizontalOffset(): number;
}

/** Range to scroll to in one dimension specified as (offset,size). May be undefined if no need to scroll. */
export type ScrollRange = [ offset: number|undefined, size: number|undefined ];

/**
 * Returns the {@link ScrollRange} corresponding to a specified item.
 * 
 * Used internally to implement {@link VirtualGridProxy.scrollToItem}. Can be used directly for 
 * advanced customization scenarios.
 */
export function getRangeToScroll(index: number | undefined, mapping: ItemOffsetMapping): ScrollRange {
  if (index === undefined)
    return [undefined, undefined];

  return [mapping.itemOffset(index), mapping.itemSize(index)];
}

/**
 * Same logic as {@link VirtualGridProxy.scrollToItem} usable with your own {@link VirtualScroll}
 * 
 * You're encouraged to put together your own combination of {@link VirtualScroll} and {@link DisplayGrid} for
 * advanced customization scenarios. This function provides `ScrollToItem` functionality for use with your own {@link VirtualScroll}.
 */
export function virtualGridScrollToItem(scrollRef: React.RefObject<VirtualScrollProxy>, rowOffsetMapping: ItemOffsetMapping, 
  columnOffsetMapping: ItemOffsetMapping, rowIndex?: number, columnIndex?: number, option?: ScrollToOption) {

  const scroll = scrollRef.current;
  /* istanbul ignore if */
  if (!scroll)
    return;

  const [rowOffset, rowSize] = getRangeToScroll(rowIndex, rowOffsetMapping);
  const [colOffset, colSize] = getRangeToScroll(columnIndex, columnOffsetMapping);

  scroll.scrollToArea(rowOffset, rowSize, colOffset, colSize, option);
}
