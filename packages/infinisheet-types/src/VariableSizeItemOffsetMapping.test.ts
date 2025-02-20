import { VariableSizeItemOffsetMapping } from './VariableSizeItemOffsetMapping'

describe('VariableSizeItemOffsetMapping', () => {
  it('all default size', () => {
    const mapping = new VariableSizeItemOffsetMapping(100, []);
    expect(mapping.itemSize(0)).toBe(100);
    expect(mapping.itemOffset(0)).toBe(0);
    expect(mapping.offsetToItem(0)).toStrictEqual([0, 0])
    expect(mapping.offsetToItem(50)).toStrictEqual([0, 0])

    expect(mapping.itemSize(1)).toBe(100);
    expect(mapping.itemOffset(1)).toBe(100);
    expect(mapping.offsetToItem(100)).toStrictEqual([1, 100])
    expect(mapping.offsetToItem(150)).toStrictEqual([1, 100])

    expect(mapping.itemSize(10)).toBe(100);
    expect(mapping.itemOffset(10)).toBe(1000);
    expect(mapping.offsetToItem(1000)).toStrictEqual([10, 1000])
    expect(mapping.offsetToItem(1050)).toStrictEqual([10, 1000])
  })

  it('one non-default size', () => {
    const mapping = new VariableSizeItemOffsetMapping(100, [50]);
    expect(mapping.itemSize(0)).toBe(50);
    expect(mapping.itemOffset(0)).toBe(0);
    expect(mapping.offsetToItem(0)).toStrictEqual([0, 0])
    expect(mapping.offsetToItem(20)).toStrictEqual([0, 0])

    expect(mapping.itemSize(1)).toBe(100);
    expect(mapping.itemOffset(1)).toBe(50);
    expect(mapping.offsetToItem(50)).toStrictEqual([1, 50])
    expect(mapping.offsetToItem(70)).toStrictEqual([1, 50])

    expect(mapping.itemSize(10)).toBe(100);
    expect(mapping.itemOffset(10)).toBe(950);
    expect(mapping.offsetToItem(950)).toStrictEqual([10, 950])
    expect(mapping.offsetToItem(1000)).toStrictEqual([10, 950])
  })
})
