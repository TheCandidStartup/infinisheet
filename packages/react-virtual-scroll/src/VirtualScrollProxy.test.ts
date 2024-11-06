import { getOffsetToScrollRange } from './VirtualScrollProxy'

describe('getOffsetToScrollRange', () => {
  it('treat undefined size as 0', () => {
    expect(getOffsetToScrollRange(200, undefined, 100, 0, 'visible')).toBe(100)
  })
})