// Based on https://github.com/realwugang/use-event-listener
// and https://github.com/donavon/use-event-listener/blob/develop/src/index.js

import { useRef, useEffect, RefObject } from 'react';

type Options = {
  capture?: boolean
  once?: boolean
  passive?: boolean
};

type Listener = Window | Document | HTMLElement;

function isListener(element: Listener | RefObject<HTMLElement>): element is Listener {
  return (element as Listener).addEventListener !== undefined;
}

export function useEventListener (eventName: string, 
                                  handler: (event: Event) => void, 
                                  element: Listener | RefObject<HTMLElement> | null = window, 
                                  options: Options = {}) {
  const savedHandler = useRef<any>();
  const { capture, passive, once } = options;

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    if (!element)
      return;

    const el =  isListener(element) ? element : element.current;
    if (!el)
      return;

    const eventListener = (event: Event) => savedHandler.current(event);
    const opts = { capture, passive, once };
    el.addEventListener(eventName, eventListener, opts);
    return () => {
      el.removeEventListener(eventName, eventListener, opts);
    };
  }, [eventName, element, capture, passive, once]);
}

export default useEventListener;