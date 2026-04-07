import { Result, StorageError, CellRangeCoords, ok, err, cellRangeCoords,
  RowColRef, rowColCoordsToRef, intersectCellRanges} from "@candidstartup/infinisheet-types";
import { SpreadsheetSnapshot } from "./SpreadsheetSnapshot";
import { CellMapEntry, SpreadsheetCellMap } from "./SpreadsheetCellMap";
import { SpreadsheetTileMap } from "./SpreadsheetTileMap";

function divmod(a: number, b: number): [number, number] {
  const remainder = a % b;
  const quotient = (a - remainder) / b;
  return [quotient, remainder];
}

// Should eventually read from any format of snapshot. Make sure we have snapshot tiles loaded that cover
// in memory tile that we want to create, then filter in required entries. Be clever about how
// we manage loaded tiles to minimize working set.
function validateSnapshot(snapshot: SpreadsheetSnapshot, tileHeight: number, tileWidth: number) {
  if (!snapshot)
    throw Error("Must have a snapshot");
  const format = snapshot.tileFormat;
  if (!format)
    throw Error("Snapshot must have a tile format");
  if (format.type !== "grid")
    throw Error("Only supports grid format");
  if (format.tileHeight != tileHeight || format.tileWidth != tileWidth)
    throw Error("Snapshot tile size must be the same as current tile size");
}

/** 
 * Map of currently loaded tiles
 * 
 * Tiles are lazy loaded/created as needed based on viewport
 * Least recently used tiles may be released
 * 
 * @internal 
 **/
export class SpreadsheetGridTileMap implements SpreadsheetTileMap {
  constructor(tileWidth = 100, tileHeight = 100) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.map = new Map<RowColRef, SpreadsheetCellMap>();
  }

  findEntry(row: number, column: number): CellMapEntry|undefined {
    const [tileRow, rowInTile] = divmod(row, this.tileHeight);
    const [tileCol, colInTile] = divmod(column, this.tileWidth);
    const key = rowColCoordsToRef(tileRow, tileCol);
    const cellMap = this.map.get(key);
    if (!cellMap)
      return undefined;

    return cellMap.findEntry(rowInTile, colInTile, 0);
  }

  async loadTiles(snapshot: SpreadsheetSnapshot, range?: CellRangeCoords): Promise<Result<void,StorageError>> {
    validateSnapshot(snapshot, this.tileHeight, this.tileWidth);
    const { rowCount, colCount } = snapshot;

    // Can't be undefined as limited by size of snapshot, could be null if requested range doesn't intersect
    const usableRange = intersectCellRanges(range, cellRangeCoords(0, 0, rowCount-1, colCount-1)) as CellRangeCoords | null;
    if (usableRange === null)
      return ok();

    const tileRowStart = Math.floor(usableRange[0] / this.tileHeight);
    const tileColStart = Math.floor(usableRange[1] / this.tileWidth);
    const tileRowEnd = Math.floor(usableRange[2] / this.tileHeight);
    const tileColEnd = Math.floor(usableRange[3] / this.tileWidth);

    // Optimization: Load tiles in parallel
    for (let row = tileRowStart; row <= tileRowEnd; row ++) {
      for (let col = tileColStart; col <= tileColEnd; col ++) {
        const key = rowColCoordsToRef(row, col);
        let cellMap = this.map.get(key);
        if (!cellMap) {
          const rowStart = tileRowStart * this.tileHeight;
          const colStart = tileColStart * this.tileWidth;
          const blob = await snapshot.loadTile(rowStart, colStart, this.tileHeight, this.tileWidth);
          if (blob.isErr())
            return err(blob.error);

          cellMap = new SpreadsheetCellMap;
          cellMap.loadSnapshot(blob.value);
          this.map.set(key, cellMap);
        }
      }
    }

    return ok();
  }

  async saveSnapshot(srcSnapshot: SpreadsheetSnapshot|undefined, changes: SpreadsheetCellMap, 
    rowCount: number, colCount: number,
    destSnapshot: SpreadsheetSnapshot, snapshotIndex: number): Promise<Result<void,StorageError>> 
  {
    destSnapshot.tileFormat = { type: "grid", tileHeight: this.tileHeight, tileWidth: this.tileWidth }
    if (srcSnapshot)
      validateSnapshot(srcSnapshot, this.tileHeight, this.tileWidth);

    // Optimization: Don't write empty tiles
    // Optimization: Use actual extents of changes and srcSnapshot to determine start of iteration
    for (let row = 0; row < rowCount; row += this.tileHeight) {
      for (let col = 0; col < colCount; col += this.tileWidth) {
        const cellMap = new SpreadsheetCellMap;
        if (srcSnapshot) {
          const blob = await srcSnapshot.loadTile(row, col, this.tileHeight, this.tileWidth);
          if (blob.isErr())
            return err(blob.error);
          cellMap.loadSnapshot(blob.value);
        }

        cellMap.loadAsSnapshot(changes, snapshotIndex, { rowMin: row, rowMax: row+this.tileHeight, columnMin: col, columnMax: col+this.tileWidth });

        const blob = cellMap.saveSnapshot(snapshotIndex);
        const blobResult = await destSnapshot.saveTile(row, col, this.tileHeight, this.tileWidth, blob);
        if (blobResult.isErr())
          return err(blobResult.error);
      }
    }

    return ok();
  }

  // Layer changes onto values from old snapshot to get same result as loading new snapshot from scratch
  // TODO - Future multi-tile optimization. If no changes apply to tile and src/dest have same layout can reuse
  //        existing tile rather than copying as tiles are immutable.
 loadAsSnapshot(src: SpreadsheetTileMap, changes: SpreadsheetCellMap, snapshotIndex: number): void {
    const srcMap = src as SpreadsheetGridTileMap;
    for (const [key,value] of srcMap.map.entries()) {
      const cellMap = new SpreadsheetCellMap;
      cellMap.loadAsSnapshot(value, snapshotIndex);
      this.map.set(key, cellMap);
    }

    for (const [row,col,value] of changes.entries(snapshotIndex)) {
      const [tileRow, rowInTile] = divmod(row, this.tileHeight);
      const [tileCol, colInTile] = divmod(col, this.tileWidth);
      const key = rowColCoordsToRef(tileRow, tileCol);
      let cellMap = this.map.get(key);
      if (!cellMap) {
        cellMap = new SpreadsheetCellMap;
        this.map.set(key,cellMap);
      }
      cellMap.loadEntryAsSnapshot(rowInTile,colInTile,value)
    }
  }

  readonly tileWidth: number;
  readonly tileHeight: number;
  private map: Map<RowColRef, SpreadsheetCellMap>
}