import { act, renderHook, fireEvent } from '@testing-library/react'
import { fireEventScrollEnd } from './test/utils'
import { useIsScrolling } from './useIsScrolling'

describe('useVirtualScroll with default argument', () => {
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
})