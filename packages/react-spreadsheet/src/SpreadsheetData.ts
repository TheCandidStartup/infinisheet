export type CellErrorValue = '#NULL!' | 
  '#DIV/0!' |
  '#VALUE!' |
  '#REF!' |
  '#NAME?' |
  '#NUM!' |
  '#N/A' |
  '#GETTING_DATA' |
  '#SPILL!' |
  '#UNKNOWN!' |
  '#FIELD!' |
  '#CALC!';

export interface CellError {
  type: 'CellError',
  value: CellErrorValue;
};

export type CellValue = string | number | boolean | null | undefined | CellError;

export interface SpreadsheetData<Snapshot> {
  subscribe: (onDataChange: () => void) => () => void,
  getSnapshot(): Snapshot,

  getRowCount(snapshot: Snapshot): number,
  getColumnCount(snapshot: Snapshot): number,
  getCellValue(snapshot: Snapshot, row: number, column: number): CellValue;
  getCellFormat(snapshot: Snapshot, row: number, column: number): string | undefined;
}

export class EmptySpreadsheetData implements SpreadsheetData<number> {
  subscribe(_onDataChange: () => void) { return () => {}; }
  getSnapshot() { return 0; }
  
  getRowCount(_snapshot: number) { return 0; }
  getColumnCount(_snapshot: number) { return 0; }
  getCellValue(_snapshot: number, _row: number, _column: number) { return null; }
  getCellFormat(_snapshot: number, _row: number, _column: number) { return undefined; }
}

