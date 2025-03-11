// Based on https://github.com/realwugang/use-event-listener
// and https://github.com/donavon/use-event-listener/blob/develop/src/index.js

import { useRef, useEffect, RefObject, createRef } from 'react';

interface Options {
  capture?: boolean
  once?: boolean
  passive?: boolean
}

type Listener = Window | Document | HTMLElement;

function isListener(element: Listener | RefObject<HTMLElement|null>): element is Listener {
  return (element as Listener).addEventListener !== undefined;
}

type EventHandler = (event: Event) => void;

export function useEventListener (eventName: string, 
                                  handler: EventHandler, 
                                  element: Listener | RefObject<HTMLElement|null> | null = window, 
                                  options: Options = {}) {
  const savedHandler = useRef<EventHandler>(undefined);
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

    const eventListener = (event: Event) => savedHandler.current?.(event);
    const opts = { capture, passive, once };
    el.addEventListener(eventName, eventListener, opts);
    return () => {
      el.removeEventListener(eventName, eventListener, opts);
    };
  }, [eventName, element, capture, passive, once]);
}

export default useEventListener;

// In-source testing for private helper functions
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('isListener', () => {
    expect(isListener(window)).toBe(true)
    expect(isListener(document)).toBe(true)
    expect(isListener(document.createElement("div"))).toBe(true)
    expect(isListener(createRef())).toBe(false)
  })
}