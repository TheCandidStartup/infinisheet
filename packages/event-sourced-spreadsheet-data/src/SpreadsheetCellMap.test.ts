import { SpreadsheetCellMap } from "./SpreadsheetCellMap";

function saveAndRestore(map: SpreadsheetCellMap, snapshotIndex: number) {
  const snapshot = map.saveSnapshot(snapshotIndex);
  const newMap = new SpreadsheetCellMap;
  newMap.loadSnapshot(snapshot);
  return newMap;
}

describe('SpreadsheetCellMap', () => {
  it('should return undefined when empty', () => {
    const map = new SpreadsheetCellMap;
    expect(map.findEntry(0,0,0)).toBeUndefined();
    expect(map.findEntry(10,20,30)).toBeUndefined();

    const map2 = new SpreadsheetCellMap;
    map2.loadAsSnapshot(map,0);
    expect(map2.findEntry(0,0,0)).toBeUndefined();
    expect(map2.findEntry(10,20,30)).toBeUndefined();
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

    const map2 = new SpreadsheetCellMap;
    map2.loadAsSnapshot(map,2);
    expect(map2.findEntry(0,0,0)).toEqual({ value: 42 })
    expect(map2.findEntry(2,3,0)).toEqual({ value: 17, format: "something" })
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

    const map2 = new SpreadsheetCellMap;
    map2.loadAsSnapshot(map,2);
    expect(map2.findEntry(0,0,0)).toEqual({ value: 17 })
  })

  it('should save and restore snapshots', () => {
    const map = new SpreadsheetCellMap;
    map.addEntry(0, 0, 0, 42);
    map.addEntry(0, 0, 1, "what", "other");
    map.addEntry(0, 0, 2, true);
    map.addEntry(0, 0, 3, undefined, "format");
    map.addEntry(0, 0, 4, null);
    map.addEntry(1, 1, 5, { type: 'CellError', value: '#CALC!'}, "something");

    const map0 = saveAndRestore(map, 0);
    expect(map0.findEntry(0,0,0)).toBeUndefined();
    expect(map0.findEntry(1,1,0)).toBeUndefined();

    const map1 = saveAndRestore(map, 1);
    expect(map1.findEntry(0,0,0)).toEqual({ value: 42 });
    expect(map1.findEntry(1,1,0)).toBeUndefined();

    const map2 = saveAndRestore(map, 2);
    expect(map2.findEntry(0,0,100)).toEqual({ value: "what", format: "other" });
    expect(map2.findEntry(1,1,100)).toBeUndefined();

    const map3 = saveAndRestore(map, 3);
    expect(map3.findEntry(0,0,100)).toEqual({ value: true });
    expect(map3.findEntry(1,1,100)).toBeUndefined();

    const map4 = saveAndRestore(map, 4);
    expect(map4.findEntry(0,0,100)).toEqual({ value: undefined, format: "format"});
    expect(map4.findEntry(1,1,100)).toBeUndefined();

    const map5 = saveAndRestore(map, 5);
    expect(map5.findEntry(0,0,100)).toEqual({ value: null });
    expect(map5.findEntry(1,1,100)).toBeUndefined();

    const map6 = saveAndRestore(map, 6);
    expect(map6.findEntry(0,0,100)).toEqual({ value: null });
    expect(map6.findEntry(1,1,100)).toEqual({ value: { type: 'CellError', value: '#CALC!'}, format: "something" });
  })
})
