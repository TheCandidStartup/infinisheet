import type { CellValue, CellFormat, SpreadsheetData, ItemOffsetMapping, Result, ResultAsync,
  SpreadsheetDataError, ValidationError, StorageError, SpreadsheetViewport } from "@candidstartup/infinisheet-types";

interface LayeredSnapshotContent<BaseSnapshot, EditSnapshot> {
  base: BaseSnapshot,
  edit: EditSnapshot
}

/** 
 * Branding Enum. Used by {@link LayeredSnapshot} to ensure that
 * you'll get a type error if you pass some random object where a `LayeredSnapshot`
 * is expected.
 * @internal
 */
export enum _LayeredSnapshotBrand { _DO_NOT_USE="" };

/**
 * Opaque type representing a {@link LayeredSpreadsheetData} snapshot. All the
 * internal implementation details are hidden from the exported API.
 */
export interface LayeredSnapshot<BaseSnapshot,EditSnapshot> {
  /** @internal */
  _brand: [ _LayeredSnapshotBrand, BaseSnapshot, EditSnapshot ]
}

function asContent<Base,Edit>(snapshot: LayeredSnapshot<Base,Edit>) {
  return snapshot as unknown as LayeredSnapshotContent<Base,Edit>;
}

function asSnapshot<Base,Edit>(snapshot: LayeredSnapshotContent<Base,Edit>) {
  return snapshot as unknown as LayeredSnapshot<Base,Edit>;
}

/**
 * Extracts the snapshot type from a {@link SpreadsheetData} instance
 */
export type SnapshotType<T> = T extends SpreadsheetData<infer TResult> ? TResult : never;

/**
 * Implementation of {@link SpreadsheetData} that layers two other `SpreadsheetData` instances on top of each other.
 * 
 * There's an "edit" layer on top where any changes are stored, with a "base" layer underneath. If a value is `undefined` in the edit layer, 
 * the corresponding value is returned from the base layer instead.
 * 
 * Common use case is a read only reference data source as the base layer with an initially empty edit layer that accepts changes.
 * 
 * @typeParam BaseData - Type of base layer `SpreadsheetData` instance
 * @typeParam EditData - Type of edit layer `SpreadsheetData` instance
 * @typeParam BaseSnapshot - Type of snapshot used by `BaseData`. By default, inferred from `BaseData`.
 * @typeParam EditSnapshot - Type of snapshot used by `EditData`. By default, inferred from `EditData`.
 */
export class LayeredSpreadsheetData<BaseData extends SpreadsheetData<BaseSnapshot>, 
  EditData extends SpreadsheetData<EditSnapshot>, BaseSnapshot = SnapshotType<BaseData>, EditSnapshot = SnapshotType<EditData>>
    implements SpreadsheetData<LayeredSnapshot<BaseSnapshot, EditSnapshot>> {

  /**
   * Creates a `LayeredSpreadsheetData` instance from two existing `SpreadsheetData` instances.
   * 
   * All type parameters can be inferred from the constructor arguments.
   * 
   * @param base - `SpreadsheetData` instance to use for the base layer
   * @param edit - `SpreadsheetData` instance to use for the edit layer
   */
  constructor(base: BaseData, edit: EditData) {
    this.base = base;
    this.edit = edit;
  }

  subscribe(onDataChange: () => void): () => void {
    const unsubscribeBase = this.base.subscribe(onDataChange);
    const unsubscribeEdit = this.edit.subscribe(onDataChange);
    return () => {
      unsubscribeBase();
      unsubscribeEdit();
    }
  }

  getSnapshot(): LayeredSnapshot<BaseSnapshot, EditSnapshot> {
    const baseSnapshot = this.base.getSnapshot();
    const editSnapshot = this.edit.getSnapshot();

    if (!this.content || this.content.base != baseSnapshot || this.content.edit != editSnapshot) {
      this.content = { base: baseSnapshot, edit: editSnapshot } ;
    }

    return asSnapshot(this.content);
  }

  getLoadStatus(snapshot: LayeredSnapshot<BaseSnapshot, EditSnapshot>): Result<boolean,StorageError> {
    const content = asContent(snapshot);
    return this.base.getLoadStatus(content.base).andThen((t1) => this.edit.getLoadStatus(content.edit).map((t2) => t1 && t2));
  }

  getRowCount(snapshot: LayeredSnapshot<BaseSnapshot, EditSnapshot>): number {
    const content = asContent(snapshot);
    return Math.max(this.base.getRowCount(content.base), this.edit.getRowCount(content.edit));
  }

  getRowItemOffsetMapping(snapshot: LayeredSnapshot<BaseSnapshot, EditSnapshot>): ItemOffsetMapping {
    return this.base.getRowItemOffsetMapping(asContent(snapshot).base);
  }

  getColumnCount(snapshot: LayeredSnapshot<BaseSnapshot, EditSnapshot>): number {
    const content = asContent(snapshot);
    return Math.max(this.base.getColumnCount(content.base), this.edit.getColumnCount(content.edit));
  }

  getColumnItemOffsetMapping(snapshot: LayeredSnapshot<BaseSnapshot, EditSnapshot>): ItemOffsetMapping {
    return this.base.getColumnItemOffsetMapping(asContent(snapshot).base);
  }

  getCellValue(snapshot: LayeredSnapshot<BaseSnapshot, EditSnapshot>, row: number, column: number): CellValue {
    const content = asContent(snapshot);
    const editValue = this.edit.getCellValue(content.edit, row, column);
    if (editValue !== undefined)
      return editValue;

    return this.base.getCellValue(content.base, row, column);
  }

  getCellFormat(snapshot: LayeredSnapshot<BaseSnapshot, EditSnapshot>, row: number, column: number): CellFormat {
    const content = asContent(snapshot);
    const editValue = this.edit.getCellValue(content.edit, row, column);
    return (editValue === undefined) ? this.base.getCellFormat(content.base, row, column) : this.edit.getCellFormat(content.edit, row, column);
  }

  setCellValueAndFormat(row: number, column: number, value: CellValue, format: CellFormat): ResultAsync<void,SpreadsheetDataError> {
    const result = this.base.isValidCellValueAndFormat(row, column, value, format);
    return result.asyncAndThen(() => this.edit.setCellValueAndFormat(row, column, value, format));
  }

  // Must be valid for both layers
  isValidCellValueAndFormat(row: number, column: number, value: CellValue, format: CellFormat): Result<void,ValidationError> {
    const result = this.base.isValidCellValueAndFormat(row, column, value, format);
    return result.andThen(() => this.edit.isValidCellValueAndFormat(row,column,value,format));
  }

  setViewport(viewport: SpreadsheetViewport | undefined): void { 
    this.base.setViewport(viewport);
    this.edit.setViewport(viewport);
  }
  getViewport(snapshot: LayeredSnapshot<BaseSnapshot, EditSnapshot>): SpreadsheetViewport | undefined { 
    const content = asContent(snapshot);
    return this.edit.getViewport(content.edit);
  }

  private base: BaseData;
  private edit: EditData;
  private content: LayeredSnapshotContent<BaseSnapshot, EditSnapshot> | undefined;
}
