import { useState } from "react";
import { useEventListener } from './useEventListener';
import { useAnimationTimeout } from './useAnimationTimeout';

const DEBOUNCE_INTERVAL = 150;

export function useIsScrolling(element: Window | HTMLElement | null = window): boolean {
  const [scrollCount, setScrollCount] = useState(0);

  const supportsScrollEnd = ('onscrollend' in window);

  useEventListener("scroll", () => setScrollCount(c => c + 1), element);
  useEventListener("scrollend", () => setScrollCount(0), supportsScrollEnd ? element : null);
  useAnimationTimeout(() => setScrollCount(0), supportsScrollEnd ? null : DEBOUNCE_INTERVAL, scrollCount);

  return scrollCount > 0;
}

export default useIsScrolling;