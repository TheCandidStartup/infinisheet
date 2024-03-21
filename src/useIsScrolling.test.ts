import { act, renderHook, fireEvent } from '@testing-library/react'
import { fireEventScrollEnd, stubProperty, unstubAllProperties } from './test/utils'
import { useIsScrolling } from './useIsScrolling'

function sleep(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

describe('useIsScrolling with default argument', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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

  it('should fallback to timer if scrollend unimplemented', async () => {
    stubProperty(window, 'onscrollend', undefined);

    const { result } = renderHook(() => useIsScrolling())
    expect(result.current).toBe(false);

    {act(() => {
      fireEvent.scroll(window, { target: { scrollTop: 100 }});
    })}
    expect(result.current).toBe(true);

    // Wait one second to be sure timeout has fired
    await act(async () => { await sleep(1000); });

    expect(result.current).toBe(false);
  })
})