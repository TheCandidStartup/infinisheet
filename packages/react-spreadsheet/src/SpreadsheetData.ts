import type { ItemOffsetMapping } from "@candidstartup/react-virtual-scroll";
export type { ItemOffsetMapping } from "@candidstartup/react-virtual-scroll";
import { useFixedSizeItemOffsetMapping } from "@candidstartup/react-virtual-scroll";

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
  subscribe(onDataChange: () => void): () => void,
  getSnapshot(): Snapshot,

  getRowCount(snapshot: Snapshot): number,
  getRowItemOffsetMapping(snapshot: Snapshot): ItemOffsetMapping,
  getColumnCount(snapshot: Snapshot): number,
  getColumnItemOffsetMapping(snapshot: Snapshot): ItemOffsetMapping,
  getCellValue(snapshot: Snapshot, row: number, column: number): CellValue;
  getCellFormat(snapshot: Snapshot, row: number, column: number): string | undefined;
  setCellValueAndFormat(row: number, column: number, value: CellValue, format: string | undefined): boolean;
}

const rowItemOffsetMapping = useFixedSizeItemOffsetMapping(30);
const columnItemOffsetMapping = useFixedSizeItemOffsetMapping(100);

export class EmptySpreadsheetData implements SpreadsheetData<number> {
  subscribe(_onDataChange: () => void) { return () => {}; }
  getSnapshot() { return 0; }
  
  getRowCount(_snapshot: number) { return 0; }
  getRowItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return rowItemOffsetMapping; }
  getColumnCount(_snapshot: number) { return 0; }
  getColumnItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return columnItemOffsetMapping; }
  getCellValue(_snapshot: number, _row: number, _column: number): CellValue { return null; }
  getCellFormat(_snapshot: number, _row: number, _column: number): string|undefined { return undefined; }
  setCellValueAndFormat(_row: number, _column: number, _value: CellValue, _format: string | undefined): boolean { return false; }
}

