import { fireEvent } from '@testing-library/react'

// Function wrapper around throw so that it can be used in an expression like
//    const value = somethingThatIsValueOrNull || throwErr("Shouldn't be null")
export function throwErr(msg: string): never {
  throw msg;
}

// jsdom does not implement any layout. All layout related properties are defined but return 0. As they
// are layout driven properties they're read only. Mock up just enough layout logic for the tests to work.
// Need to use Object.defineProperty to override read only properties.
export function overrideProp(element: HTMLElement, prop: string, val: any) {
  if (!(prop in element))
    throw `Property ${prop} doesn't exist when trying to override`;

  Object.defineProperty(element, prop, {
    value: val,
    writable: false
  });
}

// Like the regular scroll event, scrollend doesn't bubble and can't be cancelled
export function fireEventScrollEnd(element: HTMLElement | Window) {
  fireEvent(element, new UIEvent('scrollend', {
    bubbles: false,
    cancelable: false,
  }));
}