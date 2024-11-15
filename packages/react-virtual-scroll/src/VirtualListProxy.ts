import { ItemOffsetMapping, ScrollToOption } from './VirtualBase';
import { VirtualScrollProxy } from './VirtualScrollProxy';

/**
 * Custom ref handle returned by {@link VirtualList} that exposes imperative methods
 * 
 * Use `React.useRef<VirtualListProxy>(null)` to create a ref.
 */
export interface VirtualListProxy {
  /**
   * Scrolls the list to the specified offset in pixels
   * @param offset - Offset to scroll to
   */
  scrollTo(offset: number): void;

  /**
   * Scrolls the list so that the specified item is visible
   * @param index - Index of item to scroll to
   * @param option - Where to {@link ScrollToOption | position} the item within the viewport
   */
  scrollToItem(index: number, option?: ScrollToOption): void;

  /** Current scroll position */
  get offset(): number;
}

/**
 * Same logic as {@link VirtualListProxy.scrollToItem} usable with your own {@link VirtualScroll}
 * 
 * You're encouraged to put together your own combination of {@link VirtualScroll} and {@link DisplayList} for
 * advanced customization scenarios. This function provides `ScrollToItem` functionality for use with your own {@link VirtualScroll}.
 */
export function virtualListScrollToItem(scrollRef: React.RefObject<VirtualScrollProxy>, itemOffsetMapping: ItemOffsetMapping, isVertical: boolean,
  index: number, option?: ScrollToOption) {

  const scroll = scrollRef.current;
  /* istanbul ignore if */
  if (!scroll)
    return;

  const itemOffset = itemOffsetMapping.itemOffset(index);
  const itemSize = itemOffsetMapping.itemSize(index);

  if (isVertical)
    scroll.scrollToArea(itemOffset, itemSize, undefined, undefined, option);
  else
    scroll.scrollToArea(undefined, undefined, itemOffset, itemSize, option);
}