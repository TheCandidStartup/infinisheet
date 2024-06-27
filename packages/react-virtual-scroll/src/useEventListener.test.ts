import { act, renderHook, fireEvent } from '@testing-library/react'
import { createRef } from 'react';
import { useEventListener } from './useEventListener'

describe('useEventListener edge cases', () => {
  function handler(_: Event) {}

  it('should listen to window by default', () => {
    const mock = vi.fn().mockImplementation(handler);
    renderHook(() => useEventListener('scroll', mock));
    act(() => {  fireEvent.scroll(window); });
    expect(mock).toHaveBeenCalled()
  })

  it('should do nothing with a null ref', () => {
    const ref = createRef<HTMLElement>();
    const mock = vi.fn().mockImplementation(handler);
    renderHook(() => useEventListener('scroll', mock, ref));
    act(() => {  fireEvent.scroll(window); });
    expect(mock).not.toHaveBeenCalled();
  })
})