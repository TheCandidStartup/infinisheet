import { act, renderHook, fireEvent } from '@testing-library/react'
import { fireEventScrollEnd, stubProperty, unstubAllProperties } from './test/utils'
import { useIsScrolling } from './useIsScrolling'

function sleep(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

describe('useIsScrolling with default argument', () => {
  afterEach(() => {
    vi.useRealTimers();
    unstubAllProperties();
  })

  it('should have initial value', () => {
    const { result } = renderHook(() => useIsScrolling())
    expect(result.current).toBe(false);
  })

  it('should be true on scroll and false on scrollend', () => {
    const { result } = renderHook(() => useIsScrolling())
    expect(result.current).toBe(false);

    {act(() => {
      fireEvent.scroll(window, { target: { scrollTop: 100 }});
    })}
    expect(result.current).toBe(true);

    {act(() => {
      fireEventScrollEnd(window);
    })}
    expect(result.current).toBe(false);
  })

  it('should fallback to timer if scrollend unimplemented', () => {
    vi.useFakeTimers();
    stubProperty(window, 'onscrollend', undefined);

    const { result } = renderHook(() => useIsScrolling())
    expect(result.current).toBe(false);

    {act(() => {
      fireEvent.scroll(window, { target: { scrollTop: 100 }});
    })}
    expect(result.current).toBe(true);

    {act(() => {
      vi.advanceTimersByTime(1000);
    })}
    expect(result.current).toBe(false);
  })

  it('should fallback to timer if scrollend implemented but undelivered', () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useIsScrolling())
    expect(result.current).toBe(false);

    {act(() => {
      fireEvent.scroll(window, { target: { scrollTop: 100 }});
    })}
    expect(result.current).toBe(true);

    {act(() => {
      vi.advanceTimersByTime(1000);
    })}
    expect(result.current).toBe(false);
  })
})