import { CellValue, CellFormat, Result, StorageError, CellRangeCoords, ok, err, cellRangesIntersect, cellRangeCoords } from "@candidstartup/infinisheet-types";
import { SpreadsheetSnapshot } from "./SpreadsheetSnapshot";
import { SetCellValueAndFormatLogEntry } from "./SpreadsheetLogEntry";
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

  addEntries(entries: SetCellValueAndFormatLogEntry[], baseIndex: number): void {
    if (this.cellMap)
      this.cellMap.addEntries(entries,baseIndex);
  }

  addEntry(row: number, column: number, logIndex: number, value: CellValue, format?: CellFormat): void {
    if (this.cellMap)
      this.cellMap.addEntry(row, column, logIndex, value, format);
  }

  findEntry(row: number, column: number, snapshotIndex: number): CellMapEntry|undefined {
    if (!this.cellMap)
      return undefined;

    return this.cellMap.findEntry(row, column, snapshotIndex);
  }

  async loadTiles(snapshot: SpreadsheetSnapshot|undefined, logEntries: SetCellValueAndFormatLogEntry[], 
    forceExist: boolean, 
    range?: CellRangeCoords): Promise<Result<void,StorageError>> 
  {
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
        this.cellMap.addEntries(logEntries, 0);
      }
    } else if (forceExist || logEntries.length > 0) {
      // Initializing tile
      this.cellMap = new SpreadsheetCellMap;
      this.cellMap.addEntries(logEntries, 0);
    }

    return ok();
  }

  async saveSnapshot(srcSnapshot: SpreadsheetSnapshot|undefined, logEntries: SetCellValueAndFormatLogEntry[], 
    rowCount: number, colCount: number,
    destSnapshot: SpreadsheetSnapshot, snapshotIndex: number): Promise<Result<void,StorageError>> {

    if (!this.cellMap) {
      const loadResult = await this.loadTiles(srcSnapshot, logEntries, false);
      if (loadResult.isErr())
        return err(loadResult.error);
    }

    // Nothing to write if nothing in cell map
    if (this.cellMap) {
      const blob = this.cellMap.saveSnapshot(snapshotIndex);
      const blobResult = await destSnapshot.saveTile(0, 0, rowCount, colCount, blob);
      if (blobResult.isErr())
        return err(blobResult.error);
    }

    return ok();
  }

  loadAsSnapshot(src: SpreadsheetTileMap, snapshotIndex: number): void {
    const from = src as SpreadsheetGridTileMap;
    if (from.cellMap) {
      if (!this.cellMap)
        this.cellMap = new SpreadsheetCellMap;
      this.cellMap.loadAsSnapshot(from.cellMap, snapshotIndex);
    }
  }

  private cellMap: SpreadsheetCellMap | null;
}