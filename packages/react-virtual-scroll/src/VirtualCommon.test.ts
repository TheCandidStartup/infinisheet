import { getGridTemplate, getOffsetToScrollRange } from './VirtualCommon'

describe('getGridTemplate', () => {
  it('return undefined for empty array', () => {
    expect(getGridTemplate([])).toBeUndefined()
  })

  it('return single value for single argument', () => {
    expect(getGridTemplate([ 100 ])).toBe("100px")
  })

  it('return repeated value for duplicates', () => {
    expect(getGridTemplate([ 10, 10, 10 ])).toBe("repeat(3,10px)")
  })

  it('return combination for multiple values', () => {
    expect(getGridTemplate([ 10, 20, 30, 30, 40 ])).toBe("10px 20px repeat(2,30px) 40px")
  })
})

describe('getOffsetToScrollRange', () => {
  it('treat undefined size as 0', () => {
    expect(getOffsetToScrollRange(200, undefined, 100, 0, 'visible')).toBe(100)
  })
})