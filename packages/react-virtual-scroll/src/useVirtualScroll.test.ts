import { act, renderHook } from '@testing-library/react'
import { useVirtualScroll } from './useVirtualScroll'

describe('useVirtualScroll', () => {
  it('should have initial value', () => {
    const { result } = renderHook(() => useVirtualScroll(100))
    const { scrollOffset, scrollDirection } = result.current;
    expect(scrollOffset).toBe(0);
    expect(scrollDirection).toBe("forward");
  })

  it('should update offset and direction OnScroll', () => {
    const { result } = renderHook(() => useVirtualScroll(100));
    var {scrollOffset, scrollDirection, onScroll: onScrollExtent} = result.current;
    expect(scrollOffset).toBe(0);
    expect(scrollDirection).toBe("forward");

    {act(() => {
      onScrollExtent(100, 1000, 50);
    })}
    ({scrollOffset, scrollDirection, onScroll: onScrollExtent} = result.current);
    expect(scrollOffset).toBe(50);
    expect(scrollDirection).toBe("forward");

    // Duplicate scroll doesn't change direction
    {act(() => {
      onScrollExtent(100, 1000, 50);
    })}
    ({scrollOffset, scrollDirection, onScroll: onScrollExtent} = result.current);
    expect(scrollOffset).toBe(50);
    expect(scrollDirection).toBe("forward");

    {act(() => {
      onScrollExtent(100, 1000, 25);
    })}
    ({ scrollOffset, scrollDirection } = result.current);
    expect(scrollOffset).toBe(25);
    expect(scrollDirection).toBe("backward");

    // Duplicate scroll doesn't change direction
    {act(() => {
      onScrollExtent(100, 1000, 25);
    })}
    ({ scrollOffset, scrollDirection } = result.current);
    expect(scrollOffset).toBe(25);
    expect(scrollDirection).toBe("backward");
  })

  it('should support paged scrolling', () => {
    const totalSize = 1000000000000 * 30;
    const clientExtent = 240;
    const { result } = renderHook(() => useVirtualScroll(totalSize));
    var vs = result.current;

    expect(vs.scrollOffset).toBe(0);
    expect(vs.page).toBe(0);
    expect(vs.renderOffset).toBe(0);
    expect(vs.renderSize).toBe(6000000);
    expect(vs.scrollDirection).toBe("forward");

    // Small scroll within page 0
    var ret = 0;
    {act(() => {
      ([ret] = vs.onScroll(clientExtent, vs.renderSize, 50));
    })}
    vs = result.current;
    expect(ret).toBe(50);
    expect(vs.scrollOffset).toBe(50);
    expect(vs.page).toBe(0);
    expect(vs.renderOffset).toBe(0);
    expect(vs.scrollDirection).toBe("forward");

    // Jump to end of page 1
    {act(() => {
      ret = vs.doScrollTo(119970, clientExtent);
    })}
    vs = result.current;
    expect(ret).toBe(119970);
    expect(vs.scrollOffset).toBe(119970);
    expect(vs.page).toBe(1);
    expect(vs.renderOffset).toBe(0);
    expect(vs.scrollDirection).toBe("forward");

    // Small scroll across the boundary to page 2
    {act(() => {
      ([ret] = vs.onScroll(clientExtent, vs.renderSize, 120030));
    })}
    vs = result.current;
    expect(ret).toBe(60030);
    expect(vs.scrollOffset).toBe(60030);
    expect(vs.page).toBe(2);
    expect(vs.renderOffset).toBe(60000);
    expect(vs.scrollDirection).toBe("forward");

    // Small scroll back to page 1
    {act(() => {
      ([ret] = vs.onScroll(240, vs.renderSize, 59970));
    })}
    vs = result.current;
    expect(ret).toBe(119970);
    expect(vs.scrollOffset).toBe(119970);
    expect(vs.page).toBe(1);
    expect(vs.renderOffset).toBe(0);
    expect(vs.scrollDirection).toBe("backward");

    // Large scroll to halfway through range
    {act(() => {
      ([ret] = vs.onScroll(clientExtent, vs.renderSize, vs.renderSize / 2));
    })}
    vs = result.current;
    expect(ret).toBe(vs.scrollOffset);
    expect(ret).toBeLessThan(vs.renderSize);
    {
      // Expect to be within 1% of halfway point in container space
      const offset = vs.renderOffset + vs.scrollOffset;
      const halfOffset = totalSize / 2;
      const err = totalSize * 0.01;
      expect(offset).toBeGreaterThan(halfOffset-err);
      expect(offset).toBeLessThan(halfOffset+err);
    }
    expect(vs.scrollDirection).toBe("forward");

    // Large scroll to end of range
    {act(() => {
      ([ret] = vs.onScroll(clientExtent, vs.renderSize, vs.renderSize - clientExtent));
    })}
    vs = result.current;
    expect(ret).toBe(vs.scrollOffset);
    expect(ret).toBeLessThan(vs.renderSize);
    expect(vs.scrollDirection).toBe("forward");
    {
      const offset =  vs.renderOffset + vs.scrollOffset;
      expect(offset).toBe(totalSize - clientExtent);
    }

    // Jump back to halfway point in container space
    {act(() => {
      ret = vs.doScrollTo(totalSize / 2, clientExtent);
    })}
    vs = result.current;
    expect(ret).toBe(vs.scrollOffset);
    expect(ret).toBeLessThan(vs.renderSize);
    {
      // Expect to be within 1% of halfway point on scroll bar
      const offset = vs.renderOffset + vs.scrollOffset;
      expect(offset).toBe(totalSize / 2);
      const halfScroll = vs.renderSize / 2;
      const err = vs.renderSize * 0.01;
      expect(vs.scrollOffset).toBeGreaterThan(halfScroll-err);
      expect(vs.scrollOffset).toBeLessThan(halfScroll+err);
    }
    expect(vs.scrollDirection).toBe("backward");

    // Large scroll to start of range
    {act(() => {
      ([ret] = vs.onScroll(clientExtent, vs.renderSize, 0));
    })}
    vs = result.current;
    expect(ret).toBe(0);
    expect(vs.scrollOffset).toBe(0);
    expect(vs.page).toBe(0);
    expect(vs.renderOffset).toBe(0);
    expect(vs.scrollDirection).toBe("backward");
  })
})