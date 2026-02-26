import { Result, StorageError, CellRangeCoords, ok, err, cellRangesIntersect, cellRangeCoords } from "@candidstartup/infinisheet-types";
import { SpreadsheetSnapshot } from "./SpreadsheetSnapshot";
import { CellMapEntry, SpreadsheetCellMap } from "./SpreadsheetCellMap";
import { SpreadsheetTileMap } from "./SpreadsheetTileMap";

/** 
 * Map of currently loaded tiles
 * 
 * Tiles are lazy loaded/created as needed based on viewport
 * Least recently used tiles may be released
 * 
 * @internal 
 **/
export class SpreadsheetGridTileMap implements SpreadsheetTileMap {
  constructor() {
    this.cellMap = null;
  }

  findEntry(row: number, column: number): CellMapEntry|undefined {
    if (!this.cellMap)
      return undefined;

    return this.cellMap.findEntry(row, column, 0);
  }

  async loadTiles(snapshot: SpreadsheetSnapshot, range?: CellRangeCoords): Promise<Result<void,StorageError>> {
    // Tile already loaded
    if (this.cellMap)
      return ok();

    if (snapshot) {
      const { rowCount, colCount } = snapshot;
      if (rowCount && colCount && cellRangesIntersect(range, cellRangeCoords(0, 0, rowCount-1, colCount-1))) {
        const blob = await snapshot.loadTile(0, 0, rowCount, colCount);
        if (blob.isErr())
          return err(blob.error);
        this.cellMap = new SpreadsheetCellMap;
        this.cellMap.loadSnapshot(blob.value);
      }
    }

    return ok();
  }

  async saveSnapshot(srcSnapshot: SpreadsheetSnapshot|undefined, changes: SpreadsheetCellMap, 
    rowCount: number, colCount: number,
    destSnapshot: SpreadsheetSnapshot, snapshotIndex: number): Promise<Result<void,StorageError>> 
  {
    if (srcSnapshot && !this.cellMap) {
      const loadResult = await this.loadTiles(srcSnapshot);
      if (loadResult.isErr())
        return err(loadResult.error);
    }

    let cellMap = changes;
    if (this.cellMap) {
      // Merge changes into base snapshot
      cellMap = new SpreadsheetCellMap;
      cellMap.loadAsSnapshot(this.cellMap, 0);
      cellMap.loadAsSnapshot(changes, snapshotIndex);
    }

    const blob = cellMap.saveSnapshot(snapshotIndex);
    const blobResult = await destSnapshot.saveTile(0, 0, rowCount, colCount, blob);
    if (blobResult.isErr())
      return err(blobResult.error);

    return ok();
  }

  // Layer changes onto values from old snapshot to get same result as loading new snapshot from scratch
  // TODO - Future multi-tile optimization. If no changes apply to tile and src/dest have same layout can reuse
  //        existing tile rather than copying as tiles are immutable.
 loadAsSnapshot(src: SpreadsheetTileMap, changes: SpreadsheetCellMap, snapshotIndex: number): void {
    const from = src as SpreadsheetGridTileMap;
    if (!this.cellMap)
      this.cellMap = new SpreadsheetCellMap;

    if (from.cellMap)
      this.cellMap.loadAsSnapshot(from.cellMap, 0);
    this.cellMap.loadAsSnapshot(changes, snapshotIndex);
  }

  private cellMap: SpreadsheetCellMap | null;
}