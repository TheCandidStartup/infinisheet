import { CellRangeCoords, Result, StorageError } from "@candidstartup/infinisheet-types";
import { SpreadsheetSnapshot } from "./SpreadsheetSnapshot";
import { CellMapEntry, SpreadsheetCellMap } from "./SpreadsheetCellMap";

/** 
 * Map of currently loaded tiles
 * 
 * Tiles are lazy loaded/created as needed based on viewport
 * Least recently used tiles may be released
 * 
 * @internal 
 **/
export interface SpreadsheetTileMap {
  /** Return entry from corresponding tile, if present */
  findEntry(row: number, column: number): CellMapEntry|undefined;

  /** Loads any missing tiles that intersect cell range */
  loadTiles(snapshot: SpreadsheetSnapshot, range?: CellRangeCoords): Promise<Result<void,StorageError>>;

  /** Saves snapshot containing highest entry smaller than snapshotIndex for each cell 
   * 
   * Iterates over all source tiles, loading if needed, before writing new destination snapshot
   * Tiles in source and destination can be different sizes
  */
  saveSnapshot(srcSnapshot: SpreadsheetSnapshot|undefined, changes: SpreadsheetCellMap, 
    rowCount: number, colCount: number,
    destSnapshot: SpreadsheetSnapshot, snapshotIndex: number): Promise<Result<void,StorageError>>;

  /** Equivalent to merge layers then {@link saveSnapshot} followed by {@link loadSnapshot} for loaded tiles */
  loadAsSnapshot(src: SpreadsheetTileMap, changes: SpreadsheetCellMap, snapshotIndex: number): void;
}