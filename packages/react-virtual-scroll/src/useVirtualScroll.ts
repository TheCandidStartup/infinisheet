import { useState } from "react";

/** Direction of scrolling */
export type ScrollDirection = "forward" | "backward";

/**
 * Overall scroll state for a single dimension.
 */
export interface ScrollState { 
  /** Scroll bar offset. Equal to outer container's `scrollTop` or `scrollLeft` depending on dimension.  */
  scrollOffset: number, 

  /** Offset used to position current page of items in virtual space. Overall offset is `scrollOffset+renderOffset`. */
  renderOffset: number,

  /** Index of current page. */
  page: number, 

  /** Current scrolling direction. Calculated by comparing current overall offset to that when last rendered. */
  scrollDirection: ScrollDirection, 
}

export interface VirtualScrollState extends ScrollState {
  renderSize: number;

  // Returns updated scrollOffset. Caller should update scroll bar position if different from value passed in. 
  onScroll(clientExtent: number, scrollExtent: number, scrollOffset: number): [number, ScrollState];

  // Scroll to offset in logical space returning offset to update scroll bar position to
  doScrollTo(offset: number, clientExtent: number): number;
}

// Max size that is safe across all browsers (Firefox is the limiting factor)
// SlickGrid tries to dynamically determine limit on other browsers (Chrome will do 30M) but
// I prefer simplicity of same behavior across all browsers.
const MAX_SUPPORTED_CSS_SIZE = 6000000;
const MIN_NUMBER_PAGES = 100;

export function useVirtualScroll(totalSize: number, maxCssSize = MAX_SUPPORTED_CSS_SIZE, minNumberPages = MIN_NUMBER_PAGES): VirtualScrollState {
  let renderSize=0, pageSize=0, numPages=0;
  if (totalSize < maxCssSize) {
    // No paging needed
    renderSize = pageSize = totalSize;
    numPages = 1;
  } else {
    // Break into pages
    renderSize = maxCssSize;
    pageSize = renderSize / minNumberPages;
    numPages = Math.floor(totalSize / pageSize);
  }

  function pageToRenderOffset(page: number): number {
    if (page <= 0)
      return 0;

    if (page >= numPages-1)
      return totalSize - renderSize;

    return Math.round((page-1) * (totalSize - renderSize) / (numPages - 3));
  }

  const initValue: ScrollState = { 
    scrollOffset: 0, 
    renderOffset: 0,
    page: 0,
    scrollDirection: "forward",
  };
  const [scrollState, setScrollState] = useState(initValue);

  function onScroll(clientExtent: number, scrollExtent: number, scrollOffset: number): [number, ScrollState] {
    if (scrollState.scrollOffset == scrollOffset) {
      // No need to change state if scroll position unchanged
      return [scrollOffset, scrollState];
    }

    // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.
    let newOffset = Math.max(0, Math.min(scrollOffset, scrollExtent - clientExtent));
    const newScrollDirection = scrollState.scrollOffset <= newOffset ? 'forward' : 'backward';

    // Switch pages if needed
    let newPage, newRenderOffset;
    let retScrollOffset = scrollOffset;
    const scrollDist = Math.abs(newOffset - scrollState.scrollOffset);
    if (scrollDist < clientExtent) {
      // Scrolling part of visible window, don't want to skip items, so can't scale up movement
      // If we cross page boundary we need to reset scroll bar position back to where it should be at start of page
      newPage = Math.min(numPages - 1, Math.floor((scrollOffset + scrollState.renderOffset) / pageSize));
      newRenderOffset = pageToRenderOffset(newPage);
      if (newPage != scrollState.page) {
        // Be very intentional about when we ask caller to reset scroll bar
        // Don't want to trigger event loops
        newOffset = scrollOffset + scrollState.renderOffset - newRenderOffset;
        retScrollOffset = newOffset;
      }
    } else {
      // Large scale scrolling, choosing page from a rolodex
      // First and last page are mapped 1:1 between grid and container
      if (newOffset < pageSize) {
        newPage = 0;
      } else if (newOffset >= renderSize - pageSize) {
        newPage = numPages - 1;
      } else {
        const scaleFactor = (totalSize - pageSize*2) / (renderSize - pageSize*2);
        newPage = Math.min(numPages - 3, Math.floor((newOffset - pageSize) * scaleFactor / pageSize)) + 1;
      }
      newRenderOffset = pageToRenderOffset(newPage);
    }

    const newScrollState: ScrollState = 
      { scrollOffset: newOffset, renderOffset: newRenderOffset, page: newPage, scrollDirection: newScrollDirection };
    setScrollState(newScrollState);
    return [retScrollOffset, newScrollState];
  }

  function doScrollTo(offset: number, clientExtent: number) {
    const safeOffset = Math.min(totalSize - clientExtent, Math.max(offset, 0));
    const scrollDirection = (scrollState.scrollOffset + scrollState.renderOffset) <= safeOffset ? 'forward' : 'backward';
    const page = Math.min(numPages - 1, Math.floor(safeOffset / pageSize));
    const renderOffset = pageToRenderOffset(page);
    const scrollOffset = safeOffset - renderOffset;

    setScrollState({ scrollOffset, renderOffset, page, scrollDirection });
    return scrollOffset;
  }

  return {...scrollState, renderSize, onScroll, doScrollTo} as const;
}

export default useVirtualScroll;
