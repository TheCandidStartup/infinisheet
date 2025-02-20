import { indexToColRef, colRefToIndex, rowColCoordsToRef,
  splitRowColRef, rowColRefToCoords } from './RowColRef'

describe('indexToColRef', () => {
  it('should convert known values', () => {
    expect(indexToColRef(0)).toBe('A');
    expect(indexToColRef(1)).toBe('B');
    expect(indexToColRef(25)).toBe('Z');
    expect(indexToColRef(26)).toBe('AA');
    expect(indexToColRef(53)).toBe('BB');
    expect(indexToColRef(701)).toBe('ZZ');
    expect(indexToColRef(702)).toBe('AAA');
    expect(indexToColRef(16383)).toBe('XFD');
  })
})

describe('colRefToIndex', () => {
  it('should convert known values', () => {
    expect(colRefToIndex('A')).toBe(0);
    expect(colRefToIndex('B')).toBe(1);
    expect(colRefToIndex('Z')).toBe(25);
    expect(colRefToIndex('AA')).toBe(26);
    expect(colRefToIndex('BB')).toBe(53);
    expect(colRefToIndex('ZZ')).toBe(701);
    expect(colRefToIndex('AAA')).toBe(702);
    expect(colRefToIndex('XFD')).toBe(16383);
  })
})

describe('rowColCoordsToRef', () => {
  it('should convert known values', () => {
    expect(rowColCoordsToRef(0,0)).toBe('A1');
    expect(rowColCoordsToRef(1,1)).toBe('B2');
    expect(rowColCoordsToRef(26,26)).toBe('AA27');
    expect(rowColCoordsToRef(0,undefined)).toBe('1');
    expect(rowColCoordsToRef(undefined,0)).toBe('A');
    expect(rowColCoordsToRef(undefined,undefined)).toBe('');
  })
})

describe('splitRowColRef', () => {
  it('should split known values', () => {
    expect(splitRowColRef('A1')).toEqual([0,'A']);
    expect(splitRowColRef('B2')).toEqual([1,'B']);
    expect(splitRowColRef('AA27')).toEqual([26,'AA']);
    expect(splitRowColRef('1')).toEqual([0,undefined]);
    expect(splitRowColRef('A')).toEqual([undefined,'A']);
    expect(splitRowColRef('')).toEqual([undefined,undefined]);
  })
})

describe('rowColRefToCoords', () => {
  it('should split known values', () => {
    expect(rowColRefToCoords('A1')).toEqual([0,0]);
    expect(rowColRefToCoords('B2')).toEqual([1,1]);
    expect(rowColRefToCoords('AA27')).toEqual([26,26]);
    expect(rowColRefToCoords('1')).toEqual([0,undefined]);
    expect(rowColRefToCoords('A')).toEqual([undefined,0]);
    expect(rowColRefToCoords('')).toEqual([undefined,undefined]);
  })

  it('should return undefined for unknown values', () => {
    expect(rowColRefToCoords('23A')).toEqual([undefined,undefined]);
    expect(rowColRefToCoords('#')).toEqual([undefined,undefined]);
  })
})
