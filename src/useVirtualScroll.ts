import { useState } from "react";

export type ScrollLayout = "horizontal" | "vertical";
export type ScrollDirection = "forward" | "backward";
export type ScrollState = { scrollOffset: number, scrollDirection: ScrollDirection };

export function useVirtualScroll() {
  const initValue: ScrollState = { scrollOffset: 0, scrollDirection: "forward" };
  const [scrollState, setScrollState] = useState(initValue);

  function onScroll(clientExtent: number, scrollExtent: number, scrollOffset: number) {
    if (scrollState.scrollOffset == scrollOffset) {
      // No need to change state if scroll position unchanged
      return;
    }

    // Prevent Safari's elastic scrolling from causing visual shaking when scrolling past bounds.
    const newOffset = Math.max(0, Math.min(scrollOffset, scrollExtent - clientExtent));
    const newScrollDirection = scrollState.scrollOffset <= newOffset ? 'forward' : 'backward';
    setScrollState({ scrollOffset: newOffset, scrollDirection: newScrollDirection });
  }

  return [scrollState, onScroll] as const;
}

export default useVirtualScroll;
