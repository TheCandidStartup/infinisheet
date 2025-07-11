import type { LogEntry, CellData } from "@candidstartup/infinisheet-types";

// Needed for Intellisense links
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { SpreadsheetData } from "@candidstartup/infinisheet-types";

/**
 * Log entry that captures change from calling {@link SpreadsheetData.setCellValueAndFormat}
 */
export interface SetCellValueAndFormatLogEntry extends LogEntry, CellData {
  type: 'SetCellValueAndFormat';

  /** Row index of cell being modified */
  row: number;

  /** Column index of cell being modified */
  column: number;
}

/** Union of all types of Spreadsheet related log entries */
export type SpreadsheetLogEntry = SetCellValueAndFormatLogEntry;
