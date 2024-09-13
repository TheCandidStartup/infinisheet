export interface SpreadsheetData {
  subscribe: (onDataChange: () => void) => () => void,
  getSnapshot: () => number,

  getRowCount(snapshot: number): number,
  getColumnCount(snapshot: number): number,
  getCellValue(snapshot: number, row: number, column: number): string
}

export class EmptySpreadsheetData implements SpreadsheetData {
  subscribe(_onDataChange: () => void) { return () => {}; }
  getSnapshot() { return 0; }
  
  getRowCount() { return 0; }
  getColumnCount() { return 0; }
  getCellValue(_snapshot: number, _row: number, _column: number) { return ""; }
}

