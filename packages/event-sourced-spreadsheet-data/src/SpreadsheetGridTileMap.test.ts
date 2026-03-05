import { SimpleBlobStore } from "@candidstartup/simple-spreadsheet-data";
import { SpreadsheetCellMap } from "./SpreadsheetCellMap";
import { SpreadsheetGridTileMap } from "./SpreadsheetGridTileMap";
import { openSnapshot } from "./SpreadsheetSnapshot";

async function saveAndRestore(map: SpreadsheetCellMap, snapshotIndex: number) {
  const tiles = new SpreadsheetGridTileMap;
  const { rowMax, columnMax } = map.calcExtents(snapshotIndex);

  const blobStore = new SimpleBlobStore;
  const dir = await blobStore.getRootDir();
  if (dir.isErr())
    return tiles;
  const openResult = await openSnapshot(dir.value, "test");
  if (openResult.isErr())
    return tiles;
  const snapshot = openResult.value;

  const result = await tiles.saveSnapshot(undefined, map, rowMax, columnMax, snapshot, snapshotIndex);
  if (result.isErr())
    return tiles;

  const newMap = new SpreadsheetGridTileMap;
  await newMap.loadTiles(snapshot);
  return newMap;
}

describe('SpreadsheetGridTileMap', () => {
  it('should return undefined when empty', () => {
    const map = new SpreadsheetGridTileMap;
    expect(map.findEntry(0,0)).toBeUndefined();
    expect(map.findEntry(10,20)).toBeUndefined();
  })

  it('should save and restore snapshots', async () => {
    const map = new SpreadsheetCellMap;
    map.addEntry(0, 0, 0, 42);
    map.addEntry(0, 0, 1, "what", "other");
    map.addEntry(0, 0, 2, true);
    map.addEntry(0, 0, 3, undefined, "format");
    map.addEntry(0, 0, 4, null);
    map.addEntry(1, 1, 5, { type: 'CellError', value: '#CALC!'}, "something");

    const map0 = await saveAndRestore(map, 0);
    expect(map0.findEntry(0,0)).toBeUndefined();
    expect(map0.findEntry(1,1)).toBeUndefined();

    const map1 = await saveAndRestore(map, 1);
    expect(map1.findEntry(0,0)).toEqual({ value: 42 });
    expect(map1.findEntry(1,1)).toBeUndefined();

    const map2 = await saveAndRestore(map, 2);
    expect(map2.findEntry(0,0)).toEqual({ value: "what", format: "other" });
    expect(map2.findEntry(1,1)).toBeUndefined();

    const map3 = await saveAndRestore(map, 3);
    expect(map3.findEntry(0,0)).toEqual({ value: true });
    expect(map3.findEntry(1,1)).toBeUndefined();

    const map4 = await saveAndRestore(map, 4);
    expect(map4.findEntry(0,0)).toEqual({ value: undefined, format: "format"});
    expect(map4.findEntry(1,1)).toBeUndefined();

    const map5 = await saveAndRestore(map, 5);
    expect(map5.findEntry(0,0)).toEqual({ value: null });
    expect(map5.findEntry(1,1)).toBeUndefined();

    const map6 = await saveAndRestore(map, 6);
    expect(map6.findEntry(0,0)).toEqual({ value: null });
    expect(map6.findEntry(1,1)).toEqual({ value: { type: 'CellError', value: '#CALC!'}, format: "something" });
  })

  it('should save snapshot even if src tiles not loaded', async () => {
    const map = new SpreadsheetCellMap;
    map.addEntry(0, 0, 0, 42);

    const blobStore = new SimpleBlobStore;
    const dir = await blobStore.getRootDir();
    const result = await openSnapshot(dir._unsafeUnwrap(), "src");
    const srcSnapshot = result._unsafeUnwrap();

    const srcMap = new SpreadsheetGridTileMap;
    const saveResult = await srcMap.saveSnapshot(undefined, map, 1, 1, srcSnapshot, 1);
    expect (saveResult).toBeOk();

    const newMap = new SpreadsheetGridTileMap;
    const changes = new SpreadsheetCellMap;
    changes.addEntry(1, 0, 0, 88);
    const snapshot = (await openSnapshot(dir._unsafeUnwrap(), "test"))._unsafeUnwrap();
    const saveNewResult = await newMap.saveSnapshot(srcSnapshot, changes, 2, 1, snapshot, 1);
    expect (saveNewResult).toBeOk();

    const map2 = new SpreadsheetGridTileMap;
    const loadResult = await map2.loadTiles(snapshot);
    expect(loadResult).toBeOk();
    expect(map2.findEntry(0,0)).toEqual({ value: 42 });
    expect(map2.findEntry(1,0)).toEqual({ value: 88 });
  })
})
