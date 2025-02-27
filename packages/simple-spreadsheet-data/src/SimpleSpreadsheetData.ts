import type { CellValue, SpreadsheetData, RowColRef, ItemOffsetMapping } from "@candidstartup/infinisheet-types";
import { FixedSizeItemOffsetMapping, rowColCoordsToRef } from "@candidstartup/infinisheet-types";

interface CellContent {
  value: CellValue;
  format: string|undefined;
}

interface SimpleSnapshotContent {
  values: Record<RowColRef,CellContent>;
  rowCount: number;
  colCount: number;
}

export enum SimpleSnapshotBrand { _DO_NOT_USE="" };
export interface SimpleSnapshot {
  _brand: SimpleSnapshotBrand;
}

const rowItemOffsetMapping = new FixedSizeItemOffsetMapping(30);
const columnItemOffsetMapping = new FixedSizeItemOffsetMapping(100);

function asContent(snapshot: SimpleSnapshot) {
  return snapshot as unknown as SimpleSnapshotContent;
}

function asSnapshot(snapshot: SimpleSnapshotContent) {
  return snapshot as unknown as SimpleSnapshot;
}

/**
 * Reference implementation of {@link SpreadsheetData}
 * 
 * Editable in-memory spreadsheet data container. Starts out empty. Use the API to fill
 * with data!
 * 
 * Intended for use as a mock, to compare with an optimized implementation when testing and
 * for simple sample apps. Simplest possible implementation, no attempt at optimization.
 */
export class SimpleSpreadsheetData implements SpreadsheetData<SimpleSnapshot> {
  constructor () {
    this.#listeners = [];
    this.#content = {
      values: {},
      rowCount: 0,
      colCount: 0
    }
  }

  subscribe(onDataChange: () => void): () => void {
    this.#listeners = [...this.#listeners, onDataChange];
    return () => {
      this.#listeners = this.#listeners.filter(l => l !== onDataChange);
    }
  }

  getSnapshot(): SimpleSnapshot {
    return asSnapshot(this.#content);
  }

  getRowCount(snapshot: SimpleSnapshot): number {
    return asContent(snapshot).rowCount;
  }

  getRowItemOffsetMapping(_snapshot: SimpleSnapshot): ItemOffsetMapping {
    return rowItemOffsetMapping;
  }

  getColumnCount(snapshot: SimpleSnapshot): number {
    return asContent(snapshot).colCount;
  }

  getColumnItemOffsetMapping(_snapshot: SimpleSnapshot): ItemOffsetMapping {
    return columnItemOffsetMapping
  }

  getCellValue(snapshot: SimpleSnapshot, row: number, column: number): CellValue {
    const ref = rowColCoordsToRef(row, column);
    return asContent(snapshot).values[ref]?.value;
  }

  getCellFormat(snapshot: SimpleSnapshot, row: number, column: number): string | undefined {
    const ref = rowColCoordsToRef(row, column);
    return asContent(snapshot).values[ref]?.format;
  }

  setCellValueAndFormat(row: number, column: number, value: CellValue, format: string | undefined): boolean {
    const curr = this.#content;
    const ref = rowColCoordsToRef(row, column);

    // Snapshot semantics preserved by treating SimpleSnapshot as an immutable data structure which is 
    // replaced with a modified copy on every update. Yes, this is horribly inefficient. 
    // For simplicity, setting a value to undefined stores it explicitly rather than removing it. Functional
    // behavior is the same.
    this.#content = {
      values: { ...curr.values, [ref]: { value, format }},
      rowCount: Math.max(curr.rowCount, row+1),
      colCount: Math.max(curr.colCount, column+1)
    }
    this.#notifyListeners();

    return true;
  }

  #notifyListeners() {
    for (const listener of this.#listeners)
      listener();
  }

  #listeners: (() => void)[];
  #content: SimpleSnapshotContent;
}
