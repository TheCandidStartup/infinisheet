// Based on https://overreacted.io/making-setinterval-declarative-with-react-hooks/
// and https://www.joshwcomeau.com/snippets/react-hooks/use-timeout/
// and https://github.com/bvaughn/react-window/blob/master/src/timer.js
//
// Equivalent functionality to a useTimeout hook but based on requestAnimationFrame instead of setTimeout. Use
// when making frequent requests for short duration timeouts where browser may throttle setTimeout.
import { useEffect, useRef } from 'react';

type Callback = () => void;

const hasNativePerformanceNow =
  typeof performance === 'object' && typeof performance.now === 'function';

const now = hasNativePerformanceNow
  ? () => performance.now()
  : () => Date.now();

export function useAnimationTimeout(callback: Callback, delay: number | null, key?: unknown) {
  const requestRef = useRef<number>();
  const savedCallback = useRef<Callback>(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
 
  const start = now();
  
  useEffect(() => {
    function tick() {
      requestRef.current = undefined;
      if (delay === null)
        return;

      if (now() - start >= delay) {
        savedCallback.current();
      } else {
        requestRef.current = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      if (typeof requestRef.current === 'number') {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    }
  }, [delay, key]);
}

export default useAnimationTimeout;