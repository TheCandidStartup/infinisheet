// Based on https://github.com/realwugang/use-event-listener
// and https://github.com/donavon/use-event-listener/blob/develop/src/index.js

import { useRef, useEffect } from 'react';

type Options = {
  capture?: boolean
  once?: boolean
  passive?: boolean
};

export function useEventListener (eventName: string, 
                                  handler: (event: Event) => void, 
                                  element: Window | Document | HTMLElement = window, 
                                  options: Options = {}) {
  const savedHandler = useRef<any>();
  const { capture, passive, once } = options;

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) {
      return;
    }

    const eventListener = (event: Event) => savedHandler.current(event);
    const opts = { capture, passive, once };
    element.addEventListener(eventName, eventListener, opts);
    return () => {
      element.removeEventListener(eventName, eventListener, opts);
    };
  }, [eventName, element, capture, passive, once]);
}

export default useEventListener;