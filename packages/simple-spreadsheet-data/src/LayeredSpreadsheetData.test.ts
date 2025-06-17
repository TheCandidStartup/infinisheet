import { EmptySpreadsheetData, rowColCoordsToRef, CellValue, 
  validationError, Result, ValidationError, err, ok } from '@candidstartup/infinisheet-types';
import { SimpleSpreadsheetData } from './SimpleSpreadsheetData'
import { LayeredSpreadsheetData } from './LayeredSpreadsheetData'
import { spreadsheetDataInterfaceTests } from '../../infinisheet-types/src/SpreadsheetData.interface-test'

class BaseTestData extends EmptySpreadsheetData {
  getRowCount(_snapshot: number) { return 100; }
  getColumnCount(_snapshot: number) { return 26; }
  getCellValue(_snapshot: number, row: number, column: number): CellValue {
    return rowColCoordsToRef(row, column); 
  }
  getCellFormat(_snapshot: number, row: number, column: number) { 
    return `Format ${row} ${column}`
  }

  isValidCellValueAndFormat(_row: number, column: number, _value: CellValue, _format: string | undefined): Result<void,ValidationError> {
    return (column > 1) ? err(validationError("Only first two columns are editable")) : ok();
  }
}

class TestData extends LayeredSpreadsheetData<BaseTestData, SimpleSpreadsheetData> {
  constructor() {
    super(new BaseTestData, new SimpleSpreadsheetData);
  }
}

describe('LayeredSpreadsheetData', () => {
  spreadsheetDataInterfaceTests(() => new TestData, false);

  it('should start out identical to base data', () => {
    const data = new TestData;
    const snapshot = data.getSnapshot();
    const loadStatus = data.getLoadStatus(snapshot);
    expect(loadStatus.isOk()).toEqual(true);
    expect(loadStatus._unsafeUnwrap()).toEqual(true);
    expect(data.getRowCount(snapshot)).toEqual(100);
    expect(data.getColumnCount(snapshot)).toEqual(26);
    expect(data.getCellValue(snapshot, 0, 0)).toEqual("A1");
    expect(data.getCellFormat(snapshot, 0, 0)).toEqual("Format 0 0");
    expect(data.getCellValue(snapshot, 2, 3)).toEqual("D3");
    expect(data.getCellFormat(snapshot, 2, 3)).toEqual("Format 2 3");

    const rowMapping = data.getRowItemOffsetMapping(snapshot);
    expect(rowMapping.itemOffset(0)).toEqual(0);

    const columnMapping = data.getColumnItemOffsetMapping(snapshot);
    expect(columnMapping.itemOffset(0)).toEqual(0);
  })

  it('should override base with SetCellValueAndFormat', async () => {
    const data = new TestData;
    expect((await data.setCellValueAndFormat(0, 0, "In A1", undefined)).isOk()).toEqual(true);
    expect((await data.setCellValueAndFormat(1, 0, 42, "YYYY-MM-DD")).isOk()).toEqual(true);
    const snapshot = data.getSnapshot();
    expect(data.getRowCount(snapshot)).toEqual(100);
    expect(data.getColumnCount(snapshot)).toEqual(26);
    expect(data.getCellValue(snapshot, 0, 0)).toEqual("In A1");
    expect(data.getCellFormat(snapshot, 0, 0)).toEqual(undefined);
    expect(data.getCellValue(snapshot, 1, 0)).toEqual(42);
    expect(data.getCellFormat(snapshot, 1, 0)).toEqual("YYYY-MM-DD");
    expect(data.getCellValue(snapshot, 2, 3)).toEqual("D3");
    expect(data.getCellFormat(snapshot, 2, 3)).toEqual("Format 2 3");
  })

  it('should only be valid if base.isValidCellValueAndFormat', () => {
    const data = new TestData;
    expect(data.isValidCellValueAndFormat(0, 0, "In A1", undefined).isOk()).toEqual(true);
    expect(data.isValidCellValueAndFormat(0, 2, 42, "YYYY-MM-DD").isOk()).toEqual(false);
    const snapshot = data.getSnapshot();
    expect(data.getCellValue(snapshot, 0, 0)).toEqual("A1");
    expect(data.getCellValue(snapshot, 0, 1)).toEqual("B1");
  })

  it('should support layered snapshot semantics', async () => {
    const data = new TestData;
    const snapshot1 = data.getSnapshot();
    const snapshot2 = data.getSnapshot();
    expect(Object.is(snapshot1, snapshot2)).toEqual(true);
    expect(data.getRowCount(snapshot1)).toEqual(100);

    expect((await data.setCellValueAndFormat(200, 0, "In A1", undefined)).isOk()).toEqual(true);
    const snapshot3 = data.getSnapshot();
    expect(Object.is(snapshot2, snapshot3)).toEqual(false);
    expect(data.getRowCount(snapshot1)).toEqual(100);
    expect(data.getRowCount(snapshot3)).toEqual(201);
  })
})
