import { useState, RefObject } from "react";
import { useEventListener } from './useEventListener';
import { useAnimationTimeout } from './useAnimationTimeout';

const DEBOUNCE_INTERVAL = 150;
const FALLBACK_INTERVAL = 500;

export function useIsScrolling(element: Window | HTMLElement | RefObject<HTMLElement> | null = window): boolean {
  const [scrollCount, setScrollCount] = useState(0);

  // scrollend implementations in both Chrome and Firefox are buggy with missing scrollend events
  // in some circumstances (using keyboard to scroll past end in Chrome, intermittently when using mouse wheel in Firefox)
  // Use a timeout even when scrollend is supported to handle missing events. In this case we use a longer interval as
  // don't want it to be over sensitive. 
  const supportsScrollEnd = ('onscrollend' in window);
  const delay = supportsScrollEnd ? FALLBACK_INTERVAL : DEBOUNCE_INTERVAL;

  useEventListener("scroll", () => setScrollCount(c => c + 1), element);
  useEventListener("scrollend", () => setScrollCount(0), supportsScrollEnd ? element : null);
  useAnimationTimeout(() => setScrollCount(0), (scrollCount == 0) ? null : delay, scrollCount);

  return scrollCount > 0;
}

export default useIsScrolling;