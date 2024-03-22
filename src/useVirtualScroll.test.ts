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
    var [{scrollOffset, scrollDirection}, onScrollExtent] = result.current;
    expect(scrollOffset).toBe(0);
    expect(scrollDirection).toBe("forward");

    {act(() => {
      onScrollExtent(100, 1000, 50);
    })}
    ([{scrollOffset, scrollDirection}, onScrollExtent] = result.current);
    expect(scrollOffset).toBe(50);
    expect(scrollDirection).toBe("forward");

    // Duplicate scroll doesn't change direction
    {act(() => {
      onScrollExtent(100, 1000, 50);
    })}
    ([{scrollOffset, scrollDirection}, onScrollExtent] = result.current);
    expect(scrollOffset).toBe(50);
    expect(scrollDirection).toBe("forward");

    {act(() => {
      onScrollExtent(100, 1000, 25);
    })}
    ([{ scrollOffset, scrollDirection }] = result.current);
    expect(scrollOffset).toBe(25);
    expect(scrollDirection).toBe("backward");

    // Duplicate scroll doesn't change direction
    {act(() => {
      onScrollExtent(100, 1000, 25);
    })}
    ([{ scrollOffset, scrollDirection }] = result.current);
    expect(scrollOffset).toBe(25);
    expect(scrollDirection).toBe("backward");
  })
})