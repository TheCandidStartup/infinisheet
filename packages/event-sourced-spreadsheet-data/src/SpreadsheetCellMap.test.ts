import { SpreadsheetCellMap } from "./SpreadsheetCellMap";

describe('SpreadsheetCellMap', () => {
  it('should return undefined when empty', () => {
    const map = new SpreadsheetCellMap;
    expect(map.findEntry(0,0,0)).toBeUndefined();
    expect(map.findEntry(10,20,30)).toBeUndefined();
  })

  it('should work with one entry per cell', () => {
    const map = new SpreadsheetCellMap;
    map.addEntry(0, 0, 0, 42);
    expect(map.findEntry(0,0,0)).toBeUndefined();
    expect(map.findEntry(0,0,1)).toEqual({ value: 42, logIndex: 0 })

    map.addEntry(2, 3, 1, 17, "something");
    expect(map.findEntry(2,3,0)).toBeUndefined();
    expect(map.findEntry(2,3,1)).toBeUndefined();
    expect(map.findEntry(2,3,2)).toEqual({ value: 17, format: "something", logIndex: 1 })

    expect(map.findEntry(0,0,0)).toBeUndefined();
    expect(map.findEntry(0,0,1)).toEqual({ value: 42, logIndex: 0 })
    expect(map.findEntry(10,20,30)).toBeUndefined();
  })

  it('should work with multiple entries per cell', () => {
    const map = new SpreadsheetCellMap;
    map.addEntry(0, 0, 0, 42);
    map.addEntry(0, 0, 1, 17);
    map.addEntry(0, 0, 2, 99);

    expect(map.findEntry(0,0,0)).toBeUndefined();
    expect(map.findEntry(0,0,1)).toEqual({ value: 42, logIndex: 0 })
    expect(map.findEntry(0,0,2)).toEqual({ value: 17, logIndex: 1 })
    expect(map.findEntry(0,0,3)).toEqual({ value: 99, logIndex: 2 })
    expect(map.findEntry(0,0,10)).toEqual({ value: 99, logIndex: 2 })
  })
})
