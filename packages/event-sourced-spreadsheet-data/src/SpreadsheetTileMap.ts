import { CellValue, CellFormat, CellRangeCoords, Result, StorageError } from "@candidstartup/infinisheet-types";
import { SpreadsheetSnapshot } from "./SpreadsheetSnapshot";
import { SetCellValueAndFormatLogEntry } from "./SpreadsheetLogEntry";
import { CellMapEntry } from "./SpreadsheetCellMap";

/** 
 * Map of currently loaded tiles
 * 
 * Tiles are lazy loaded/created as needed based on viewport
 * Least recently used tiles may be released
 * 
 * @internal 
 **/
export interface SpreadsheetTileMap {
  /** Add entries to tiles in map, ignoring any entries for unloaded tiles */
  addEntries(entries: SetCellValueAndFormatLogEntry[], baseIndex: number): void;

  /** Add entry to corresponding tile, ignoring if tile not loaded */
  addEntry(row: number, column: number, logIndex: number, value: CellValue, format?: CellFormat): void;

  /** Return entry with highest index smaller than `snapshotIndex` */
  findEntry(row: number, column: number, snapshotIndex: number): CellMapEntry|undefined;

  /** Loads any missing tiles that intersect cell range and adds log entries relevant to those tiles 
   * Use `forceExist` to control whether empty tiles are created if nothing in snapshot
  */
  loadTiles(snapshot: SpreadsheetSnapshot|undefined, logEntries: SetCellValueAndFormatLogEntry[],
    forceExist: boolean, range?: CellRangeCoords): Promise<Result<void,StorageError>>;

  /** Saves snapshot containing highest entry smaller than snapshotIndex for each cell 
   * 
   * Iterates over all source tiles, loading if needed, before writing new destination snapshot
   * Tiles in source and destination can be different sizes
  */
  saveSnapshot(srcSnapshot: SpreadsheetSnapshot|undefined, logEntries: SetCellValueAndFormatLogEntry[], 
    rowCount: number, colCount: number,
    destSnapshot: SpreadsheetSnapshot, snapshotIndex: number): Promise<Result<void,StorageError>>;

  /** Equivalent to {@link saveSnapshot} followed by {@link loadSnapshot} for loaded tiles */
  loadAsSnapshot(src: SpreadsheetTileMap, snapshotIndex: number): void;
}