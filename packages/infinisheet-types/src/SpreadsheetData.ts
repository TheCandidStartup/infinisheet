import type { ItemOffsetMapping } from "./ItemOffsetMapping";
import { FixedSizeItemOffsetMapping } from "./FixedSizeItemOffsetMapping";
import { Result, ok } from "./Result";
import { ResultAsync, errAsync } from "./ResultAsync";
import { ValidationError, StorageError, storageError } from "./Error";

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
export type CellValue = string | number | boolean | null | undefined | CellError

/** Format of cell typically used when displaying numbers */
export type CellFormat = string | undefined;

/** Data stored in a spreadsheet cell */
export interface CellData {
  /** Value of cell */
  value: CellValue;

  /** Format of cell */
  format?: CellFormat;
}

/** A viewport onto the spreadsheet. Usually the portion of the spreadsheet visible on-screen. */
export interface SpreadsheetViewport {
  /** Offset down the rows to the start of the viewport (using {@link ItemOffsetMapping} offsets) */
  rowMinOffset: number,

  /** Offset along the columns to the start of the viewport (using {@link ItemOffsetMapping} offsets) */
  columnMinOffset: number,

  /** Viewport width */
  width: number,

  /** Viewport height */
  height: number
}

/** Are two viewports equal by value? */
export function equalViewports(a: SpreadsheetViewport | undefined, b: SpreadsheetViewport | undefined): boolean {
  if (a === b)
    return true;

  if (!a || !b)
    return false;

  return a.rowMinOffset === b.rowMinOffset &&
    a.columnMinOffset === b.columnMinOffset &&
    a.width === b.width &&
    a.height === b.height;
}

/** Creates an empty viewport */
export function emptyViewport(): SpreadsheetViewport {
  return { rowMinOffset: 0, columnMinOffset: 0, width: 0, height: 0 }
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
  subscribe(onDataChange: () => void): () => void

  /** Return a snapshot to use when accessing values at a consistent point in time */
  getSnapshot(): Snapshot

  /** 
   * Return load status at the time the snapshot was created 
   * 
   * On Success returns true if load has completed, false if still in progress
   * On Err returns most recent error reported by the storage system
   */
  getLoadStatus(snapshot: Snapshot): Result<boolean,StorageError>

  /** Number of rows in the spreadsheet */
  getRowCount(snapshot: Snapshot): number

  /** {@link ItemOffsetMapping} which describes sizes and offsets to start of rows */
  getRowItemOffsetMapping(snapshot: Snapshot): ItemOffsetMapping

    /** Number of columns in the spreadsheet */
  getColumnCount(snapshot: Snapshot): number

  /** {@link ItemOffsetMapping} which describes sizes and offsets to start of columns */
  getColumnItemOffsetMapping(snapshot: Snapshot): ItemOffsetMapping

  /** Value of specified cell using 0-based row and column indexes */
  getCellValue(snapshot: Snapshot, row: number, column: number): CellValue

  /** Format of specified cell using 0-based row and column indexes */
  getCellFormat(snapshot: Snapshot, row: number, column: number): CellFormat

  /** Set value and format of specified cell
   * 
   * @returns `Ok` if the change was successfully applied
   */
  setCellValueAndFormat(row: number, column: number, value: CellValue, format: CellFormat): ResultAsync<void,SpreadsheetDataError>

  /** Check whether value and format are valid to set for specified cell
   * 
   * @returns `Ok` if the value and format are valid
   */
  isValidCellValueAndFormat(row: number, column: number, value: CellValue, format: CellFormat): Result<void,ValidationError>

  /** Set viewport of interest
   * 
   * Can be used by `SpreadsheetData` implementations to optimize data retrieval and memory usage.
   * Queries for cells outside the viewport *may* return `undefined`. Clients should not rely on any particular behavior
   * for queries outside the viewport.
   * 
   * Set to undefined (the default) if the client needs access to the entire spreadsheet
   */
  setViewport(viewport: SpreadsheetViewport | undefined): void

  /** Return the viewport in force (if any) */
  getViewport(snapshot: Snapshot): SpreadsheetViewport | undefined
}

const rowItemOffsetMapping = new FixedSizeItemOffsetMapping(30);
const columnItemOffsetMapping = new FixedSizeItemOffsetMapping(100);

export class EmptySpreadsheetData implements SpreadsheetData<number> {
  constructor() {
    this.viewport = undefined;
  }

  subscribe(_onDataChange: () => void) { return () => {}; }
  getSnapshot() { return 0; }
  
  getLoadStatus(_snapshot: number): Result<boolean,StorageError> { return ok(true); }
  getRowCount(_snapshot: number) { return 0; }
  getRowItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return rowItemOffsetMapping; }
  getColumnCount(_snapshot: number) { return 0; }
  getColumnItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return columnItemOffsetMapping; }
  getCellValue(_snapshot: number, _row: number, _column: number): CellValue { return null; }
  getCellFormat(_snapshot: number, _row: number, _column: number): string|undefined { return undefined; }
  setCellValueAndFormat(_row: number, _column: number, _value: CellValue, _format: CellFormat): ResultAsync<void,SpreadsheetDataError> 
  { return errAsync(storageError("Not implemented", 501)); }
  isValidCellValueAndFormat(_row: number, _column: number, _value: CellValue, _format: CellFormat): Result<void,ValidationError> 
  { return ok(); }

  setViewport(viewport: SpreadsheetViewport | undefined): void { this.viewport = viewport; }
  getViewport(_snapshot: number): SpreadsheetViewport | undefined { return this.viewport }

  private viewport: SpreadsheetViewport | undefined;
}

