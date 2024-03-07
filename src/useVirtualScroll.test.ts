import { act, renderHook } from '@testing-library/react'
import { useVirtualScroll } from './useVirtualScroll'

describe('useVirtualScroll', () => {
  it('should have initial value', () => {
    const { result } = renderHook(() => useVirtualScroll())
    const [{ scrollOffset, scrollDirection }] = result.current;
    expect(scrollOffset).toBe(0);
    expect(scrollDirection).toBe("forward");
  })

  it('should update offset and direction OnScroll', () => {
    const { result } = renderHook(() => useVirtualScroll());
    const [{}, onScrollExtent] = result.current;
    
    act(() => {
      onScrollExtent(100, 1000, 50);
    })
    
    const [{ scrollOffset, scrollDirection }] = result.current;
    expect(scrollOffset).toBe(50);
    expect(scrollDirection).toBe("forward");
  })
})