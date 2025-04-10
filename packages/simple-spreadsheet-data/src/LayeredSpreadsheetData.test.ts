import { EmptySpreadsheetData, rowColCoordsToRef, CellValue } from '@candidstartup/infinisheet-types';
import { SimpleSpreadsheetData } from './SimpleSpreadsheetData'
import { LayeredSpreadsheetData } from './LayeredSpreadsheetData'

class BaseTestData extends EmptySpreadsheetData {
  getRowCount(_snapshot: number) { return 100; }
  getColumnCount(_snapshot: number) { return 26; }
  getCellValue(_snapshot: number, row: number, column: number): CellValue {
    return rowColCoordsToRef(row, column); 
  }
  getCellFormat(_snapshot: number, row: number, column: number) { 
    return `Format ${row} ${column}`
  }
}

class TestData extends LayeredSpreadsheetData<BaseTestData, SimpleSpreadsheetData> {
  constructor() {
    super(new BaseTestData, new SimpleSpreadsheetData);
  }
}

describe('LayeredSpreadsheetData', () => {
  it('should start out identical to base data', () => {
    const data = new TestData;
    const snapshot = data.getSnapshot();
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

  it('should implement SetCellValueAndFormat', () => {
    const data = new TestData;
    expect(data.setCellValueAndFormat(0, 0, "In A1", undefined).isOk()).toEqual(true);
    expect(data.setCellValueAndFormat(0, 1, 42, "YYYY-MM-DD").isOk()).toEqual(true);
    const snapshot = data.getSnapshot();
    expect(data.getRowCount(snapshot)).toEqual(100);
    expect(data.getColumnCount(snapshot)).toEqual(26);
    expect(data.getCellValue(snapshot, 0, 0)).toEqual("In A1");
    expect(data.getCellFormat(snapshot, 0, 0)).toEqual(undefined);
    expect(data.getCellValue(snapshot, 0, 1)).toEqual(42);
    expect(data.getCellFormat(snapshot, 0, 1)).toEqual("YYYY-MM-DD");
    expect(data.getCellValue(snapshot, 2, 3)).toEqual("D3");
    expect(data.getCellFormat(snapshot, 2, 3)).toEqual("Format 2 3");
  })

  it('should support snapshot semantics', () => {
    const data = new TestData;
    const snapshot1 = data.getSnapshot();
    const snapshot2 = data.getSnapshot();
    expect(Object.is(snapshot1, snapshot2)).toEqual(true);
    expect(data.getRowCount(snapshot1)).toEqual(100);

    expect(data.setCellValueAndFormat(200, 0, "In A1", undefined).isOk()).toEqual(true);
    const snapshot3 = data.getSnapshot();
    expect(Object.is(snapshot2, snapshot3)).toEqual(false);
    expect(data.getRowCount(snapshot1)).toEqual(100);
    expect(data.getRowCount(snapshot3)).toEqual(201);
  })

  it('should support subscribe semantics', () => {
    const data = new TestData;

    const mock = vi.fn();
    const unsubscribe = data.subscribe(mock);

    data.setCellValueAndFormat(0, 0, "In A1", undefined);
    expect(mock).toBeCalledTimes(1);

    data.setCellValueAndFormat(0, 0, 42, undefined);
    expect(mock).toBeCalledTimes(2);

    unsubscribe();
    data.setCellValueAndFormat(0, 0, false, undefined);
    expect(mock).toBeCalledTimes(2);
  })
})
