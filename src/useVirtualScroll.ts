import { useState } from "react";

export type ScrollLayout = "horizontal" | "vertical";
export type ScrollDirection = "forward" | "backward";
export interface ScrollState { 
  scrollOffset: number, 
  renderOffset: number,
  page: number, 
  scrollDirection: ScrollDirection, 
};

export interface VirtualScroll extends ScrollState {
  renderSize: number;

  // Returns updated scrollOffset. Caller should update scroll bar position if different from value passed in. 
  onScroll(clientExtent: number, scrollExtent: number, scrollOffset: number): number;

  // Scroll to offset in logical space returning offset to update scroll bar position to
  doScrollTo(offset: number): number;
};

// Max size that is safe across all browsers (Firefox is the limiting factor)
// SlickGrid tries to dynamically determine limit on other browsers (Chrome will do 30M) but
// I prefer simplicity of same behavior across all browsers.
const MAX_SUPPORTED_CSS_SIZE = 6000000;
const MIN_NUMBER_PAGES = 100;

export function useVirtualScroll(totalSize: number): VirtualScroll {
  let renderSize=0, pageSize=0, numPages=0, scaleFactor=0;
  if (totalSize < MAX_SUPPORTED_CSS_SIZE) {
    // No paging needed
    renderSize = pageSize = totalSize;
    numPages = 1;
    scaleFactor = 0;
  } else {
    // Break into pages
    renderSize = MAX_SUPPORTED_CSS_SIZE;
    pageSize = renderSize / MIN_NUMBER_PAGES;
    numPages = Math.floor(totalSize / pageSize);
    scaleFactor = (totalSize - renderSize) / (numPages - 1);
  }

  const initValue: ScrollState = { 
    scrollOffset: 0, 
    renderOffset: 0,
    page: 0,
    scrollDirection: "forward",
  };
  const [scrollState, setScrollState] = useState(initValue);

  function onScroll(clientExtent: number, scrollExtent: number, scrollOffset: number) {
    if (scrollState.scrollOffset == scrollOffset) {
      // No need to change state if scroll position unchanged
      return scrollOffset;
    }

    // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.
    const newOffset = Math.max(0, Math.min(scrollOffset, scrollExtent - clientExtent));
    const newScrollDirection = scrollState.scrollOffset <= newOffset ? 'forward' : 'backward';

    // Switch pages if needed
    let newPage, newRenderOffset;
    let retScrollOffset = scrollOffset;
    const scrollDist = Math.abs(newOffset - scrollState.scrollOffset);
    if (scrollDist < clientExtent) {
      // Scrolling part of visible window, don't want to skip items, so can't scale up movement
      // If we cross page boundary we need to reset scroll bar position back to where it should be at start of page
      newPage = Math.min(numPages - 1, Math.floor((scrollOffset + scrollState.renderOffset) / pageSize));
      newRenderOffset = Math.round(newPage * scaleFactor);
      if (newPage != scrollState.page) {
        // Be very intentional about when we ask caller to reset scroll bar
        // Don't want to trigger event loops
        retScrollOffset = scrollOffset + scrollState.renderOffset - newRenderOffset;
      }
    } else {
      // Large scale scrolling, choosing page from a rolodex
      if (renderSize === clientExtent) {
        newPage = 0;
      } else {
        newPage = Math.min(numPages - 1, Math.floor(newOffset * ((totalSize - clientExtent) / (renderSize - clientExtent)) * (1 / pageSize)));
      }
      newRenderOffset = Math.round(newPage * scaleFactor);
    }

    setScrollState({ scrollOffset: newOffset, renderOffset: newRenderOffset, page: newPage, scrollDirection: newScrollDirection });
    return retScrollOffset;
  }

  function doScrollTo(offset: number) {
    const safeOffset = Math.min(totalSize, Math.max(offset, 0));
    const scrollDirection = (scrollState.scrollOffset + scrollState.renderOffset) <= safeOffset ? 'forward' : 'backward';
    const page = Math.min(numPages - 1, Math.floor(safeOffset / pageSize));
    const renderOffset = Math.round(page * scaleFactor);
    const scrollOffset = safeOffset - renderOffset;

    setScrollState({ scrollOffset, renderOffset, page, scrollDirection });
    return scrollOffset;
  }

  return {...scrollState, renderSize, onScroll, doScrollTo} as const;
}

export default useVirtualScroll;
