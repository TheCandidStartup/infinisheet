import type { LogEntry, CellValue } from "@candidstartup/infinisheet-types";

export interface SetCellValueAndFormatLogEntry extends LogEntry {
  type: 'SetCellValueAndFormat';
  row: number;
  column: number;
  value: CellValue;
  format?: string|undefined;
}

export type SpreadsheetLogEntry = SetCellValueAndFormatLogEntry;
