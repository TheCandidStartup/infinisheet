import { ScrollToOption } from './VirtualBase';

/**
 * Custom ref handle returned by {@link VirtualScroll} that exposes imperative methods
 * 
 * Use `React.useRef<VirtualScrollProxy>(null)` to create a ref.
 */
export interface VirtualScrollProxy {
  /**
   * Scrolls to the specified vertical and horizontal offset in pixels
   * Either offset can be left undefined to scroll in one dimension only
   * @param verticalOffset - Offset to scroll to vertically
   * @param horizontalOffset - Offset to scroll to horizontally
   */
  scrollTo(verticalOffset?: number, horizontalOffset?: number): void;

    /**
   * Scrolls to the specified area
   * Either offset/size pair can be left undefined to scroll in one dimension only
   * @param verticalOffset - Offset to scroll to vertically
   * @param verticalSize - Size of target area vertically
   * @param horizontalOffset - Offset to scroll to horizontally
   * @param horizontalSize - Size of target area horizontally
   * @param option - Where to {@link ScrollToOption | position} the area within the viewport
   */
  scrollToArea(verticalOffset?: number, verticalSize?: number, horizontalOffset?: number, horizontalSize?: number, option?: ScrollToOption): void;

  /** Exposes DOM clientWidth property */
  get clientWidth(): number;

  /** Exposes DOM clientHeight property */
  get clientHeight(): number;

  /** Current vertical position of scroll bar */
  get verticalOffset(): number;

    /** Current horizontal position of scroll bar */
  get horizontalOffset(): number;
}

/**
 * Returns the offset needed to scroll in one dimension for a specified range
 * 
 * Used internally to implement {@link VirtualScrollProxy.scrollToArea}. Can be used directly for 
 * advanced customization scenarios.
 */
export function getOffsetToScrollRange(offset: number | undefined, size: number | undefined, 
  clientExtent: number, scrollOffset: number, option?: ScrollToOption): number | undefined
{
  if (offset === undefined)
    return undefined;

  if (option != 'visible')
    return offset;

  // Start of item offscreen before start of viewport?
  if (offset < scrollOffset)
    return offset;

  size = size || 0;

  // Already completely visible?
  const endOffset = offset + size;
  const endViewport = scrollOffset + clientExtent;
  if (endOffset <= endViewport)
    return undefined;

  // Item offscreen past end of viewport

  // Item bigger than viewport? Make sure start is in view
  if (size > clientExtent)
    return offset;

  // Scroll so end of item aligns with end of viewport
  return offset - clientExtent + size;
 }
