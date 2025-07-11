import { CellValue, CellData, CellFormat, RowColRef, rowColCoordsToRef } from "@candidstartup/infinisheet-types";
import { SetCellValueAndFormatLogEntry } from "./SpreadsheetLogEntry";

/**
 * Entry stored in a {@link SpreadsheetCellMap}
 * @internal
 */
export interface CellMapEntry extends CellData {
  /** Index of entry within `LogSegment` */
  logIndex?: number | undefined;
}

function bestEntry(entry: CellMapEntry | CellMapEntry[], snapshotIndex: number): CellMapEntry | undefined {
  if (!Array.isArray(entry))
    return (entry.logIndex === undefined || entry.logIndex < snapshotIndex) ? entry : undefined;

  // Future optimization: Check 3 entries then switch to binary chop
  for (let i = entry.length-1; i >= 0; i --) {
    const t = entry[i]!;
    if (t.logIndex === undefined || t.logIndex < snapshotIndex)
      return t;
  }

  return undefined;
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

  addEntry(row: number, column: number, logIndex: number, value: CellValue, format?: CellFormat): void {
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
    return entry ? bestEntry(entry, snapshotIndex) : undefined;
  }

  /** Saves snapshot containing highest entry smaller than snapshotIndex for each cell */
  saveSnapshot(snapshotIndex: number): Uint8Array {
    const output: { [index: string]: CellData } = {};
    for (const [key,value] of this.map.entries()) {
      const entry = bestEntry(value,snapshotIndex);
      if (entry) {
        const { logIndex: _logIndex, ...rest } = entry;
        output[key] = rest;
      }
    }
    const json = JSON.stringify(output);

    const encoder = new TextEncoder;
    return encoder.encode(json);
  }

  /** Initializes map with content of snapshot */
  loadSnapshot(snapshot: Uint8Array): void {
    const decoder = new TextDecoder;
    const inputString = decoder.decode(snapshot);
    const input: unknown = JSON.parse(inputString);
    if (!input || typeof input !== 'object')
      throw Error("Failed to parse snapshot, root is not an object");

    this.map.clear();
    for (const [key,anyValue] of Object.entries(input)) {
      // Tracer bullet, no validation that value is valid!
      const value = anyValue as CellData;
      this.map.set(key, value);
    }
  }

  private map: Map<RowColRef, CellMapEntry | CellMapEntry[]>
}