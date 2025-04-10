import type { ItemOffsetMapping } from "./ItemOffsetMapping";
import { FixedSizeItemOffsetMapping } from "./FixedSizeItemOffsetMapping";
import { Result, err } from "./Result";

/** Possible spreadsheet error values
 * 
 * Includes those that can be returned by `ERROR.TYPE` and additional values
 * introduced by more recent versions of Excel.
*/
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

/** Type that represents an error value stored in a cell
 * 
 * Defined as a discriminated union so that additional cell value types
 * can be added in future.
 */
export interface CellError {
  /** Discriminated union tag */
  type: 'CellError',

  /** {@link CellErrorValue | Error Value} */
  value: CellErrorValue;
};

/** Possible types for a cell value 
 * 
 * The native JavaScript types string, number and boolean represent the *Text*, *Number* and *Logical*
 * spreadsheet data types. {@link CellError} represents an *Error Value*.
 * 
 * Undefined is used to represent a cell with no defined value. Null represents a cell that has been
 * explicitly marked as empty. 
*/
export type CellValue = string | number | boolean | null | undefined | CellError;

/** Type that represents an error when validating data to be stored in a cell */
export interface ValidationError {
  /** Discriminated union tag */
  type: 'ValidationError',

  /** End user message describing the problem */
  message: string,
};

/** Convenience method that creates a {@link ValidationError} */
export function validationError(message: string): ValidationError {
  return { type: 'ValidationError', message };
}

/** Type that represents an error when storing data in a cell */
export interface StorageError {
  /** Discriminated union tag */
  type: 'StorageError',

  /** End user message describing the problem */
  message: string,

  /** HTTP style status code
   * 
   * Describes the type of problem encountered. Expected to be a 4XX or 5XX code.
   */
  statusCode?: number | undefined,
};

/** Convenience method that creates a {@link StorageError} */
export function storageError(message: string, statusCode?: number): StorageError {
  return { type: 'StorageError', message, statusCode };
}

/** Types of error that can be returned by {@link SpreadsheetData} methods */
export type SpreadsheetDataError = ValidationError | StorageError;

/**
 * Interface used to access the data in a spreadsheet
 * 
 * The data exposed through the interface may change over time outside of any changes made through the interface. The caller
 * can use the {@link subscribe} method to be notified when the data changes. When reading data, the caller must first request
 * a snapshot using {@link getSnapshot}. All values returned by gettors are relative to a specified snapshot. The values will be
 * consistent with each other as long as the same snapshot is used.
 * 
 * @typeParam Snapshot - Type of snapshot. Implementations are free to use whatever type makes sense for them.
 */
export interface SpreadsheetData<Snapshot> {
  /** Subscribe to data changes */
  subscribe(onDataChange: () => void): () => void,

  /** Return a snapshot to use when accessing values at a consistent point in time */
  getSnapshot(): Snapshot,

  /** Number of rows in the spreadsheet */
  getRowCount(snapshot: Snapshot): number,

  /** {@link ItemOffsetMapping} which describes sizes and offsets to start of rows */
  getRowItemOffsetMapping(snapshot: Snapshot): ItemOffsetMapping,

    /** Number of columns in the spreadsheet */
  getColumnCount(snapshot: Snapshot): number,

  /** {@link ItemOffsetMapping} which describes sizes and offsets to start of columns */
  getColumnItemOffsetMapping(snapshot: Snapshot): ItemOffsetMapping,

  /** Value of specified cell using 0-based row and column indexes */
  getCellValue(snapshot: Snapshot, row: number, column: number): CellValue;

  /** Format of specified cell using 0-based row and column indexes */
  getCellFormat(snapshot: Snapshot, row: number, column: number): string | undefined;

  /** Set value and format of specified cell
   * 
   * @returns `Ok` if the change was successfully applied
   */
  setCellValueAndFormat(row: number, column: number, value: CellValue, format: string | undefined): Result<void,SpreadsheetDataError>
}

const rowItemOffsetMapping = new FixedSizeItemOffsetMapping(30);
const columnItemOffsetMapping = new FixedSizeItemOffsetMapping(100);

export class EmptySpreadsheetData implements SpreadsheetData<number> {
  subscribe(_onDataChange: () => void) { return () => {}; }
  getSnapshot() { return 0; }
  
  getRowCount(_snapshot: number) { return 0; }
  getRowItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return rowItemOffsetMapping; }
  getColumnCount(_snapshot: number) { return 0; }
  getColumnItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return columnItemOffsetMapping; }
  getCellValue(_snapshot: number, _row: number, _column: number): CellValue { return null; }
  getCellFormat(_snapshot: number, _row: number, _column: number): string|undefined { return undefined; }
  setCellValueAndFormat(_row: number, _column: number, _value: CellValue, _format: string | undefined): Result<void,SpreadsheetDataError> 
  { return err(storageError("Not implemented", 501)); }
}

