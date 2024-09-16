export interface SpreadsheetData<Snapshot> {
  subscribe: (onDataChange: () => void) => () => void,
  getSnapshot(): Snapshot,

  getRowCount(snapshot: Snapshot): number,
  getColumnCount(snapshot: Snapshot): number,
  getCellValue(snapshot: Snapshot, row: number, column: number): string
}

export class EmptySpreadsheetData implements SpreadsheetData<number> {
  subscribe(_onDataChange: () => void) { return () => {}; }
  getSnapshot() { return 0; }
  
  getRowCount(_snapshot: number) { return 0; }
  getColumnCount(_snapshot: number) { return 0; }
  getCellValue(_snapshot: number, _row: number, _column: number) { return ""; }
}

