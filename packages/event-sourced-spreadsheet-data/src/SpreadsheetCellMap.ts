import { CellValue, RowColRef, rowColCoordsToRef } from "@candidstartup/infinisheet-types";
import { SetCellValueAndFormatLogEntry } from "./SpreadsheetLogEntry";

/**
 * Entry stored in a {@link SpreadsheetCellMap}
 * @internal
 */
export interface CellMapEntry {
  /** Value of cell */
  value: CellValue;

  /** Format of cell */
  format?: string|undefined;

  /** Index of entry within `LogSegment` */
  logIndex: number;
}

/** @internal */
export class SpreadsheetCellMap {
  constructor() {
    this.map = new Map<RowColRef, CellMapEntry | CellMapEntry[]>();
  }

  addEntries(entries: SetCellValueAndFormatLogEntry[], baseIndex: number): void {
    entries.forEach((value, index) => {
      this.addEntry(value.row, value.column, baseIndex+index, value.value, value.format);
    })
  }

  addEntry(row: number, column: number, logIndex: number, value: CellValue, format?: string): void {
    const key = rowColCoordsToRef(row, column);
    const newEntry = { value, format, logIndex };

    const entry = this.map.get(key);
    if (!entry) {
      this.map.set(key, newEntry)
      return;
    }

    if (Array.isArray(entry)) {
      entry.push(newEntry);
    } else {
      this.map.set(key, [ entry, newEntry ]);
    }
  }

  /** Return entry with highest index smaller than `snapshotIndex` */
  findEntry(row: number, column: number, snapshotIndex: number): CellMapEntry|undefined {
    const key = rowColCoordsToRef(row, column);
    const entry = this.map.get(key);
    if (!entry)
      return undefined;

    if (!Array.isArray(entry))
      return (entry.logIndex < snapshotIndex) ? entry : undefined;

    // Future optimization: Check last 3 entries then switch to binary chop
    for (let i = entry.length-1; i >= 0; i --) {
      const t = entry[i]!;
      if (t.logIndex < snapshotIndex)
        return t;
    }

    return undefined;
  }

  private map: Map<RowColRef, CellMapEntry | CellMapEntry[]>
}