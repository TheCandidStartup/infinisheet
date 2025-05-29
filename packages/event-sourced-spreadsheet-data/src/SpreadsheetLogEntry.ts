import type { LogEntry, CellValue } from "@candidstartup/infinisheet-types";

// Needed for Intellisense links
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SpreadsheetData } from "@candidstartup/infinisheet-types";

/**
 * Log entry that captures change from calling {@link SpreadsheetData.setCellValueAndFormat}
 */
export interface SetCellValueAndFormatLogEntry extends LogEntry {
  type: 'SetCellValueAndFormat';

  /** Row index of cell being modified */
  row: number;

  /** Column index of cell being modified */
  column: number;

  /** Value of cell being modified */
  value: CellValue;

  /** Format of cell being modified */
  format?: string|undefined;
}

/** Union of all types of Spreadsheet related log entries */
export type SpreadsheetLogEntry = SetCellValueAndFormatLogEntry;
