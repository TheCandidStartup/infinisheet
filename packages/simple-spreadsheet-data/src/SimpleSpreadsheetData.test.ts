import { SimpleSpreadsheetData } from './SimpleSpreadsheetData'

describe('SimpleSpreadsheetData', () => {
  it('should start out empty', () => {
    const data = new SimpleSpreadsheetData;
    const snapshot = data.getSnapshot();
    expect(data.getRowCount(snapshot)).toEqual(0);
    expect(data.getColumnCount(snapshot)).toEqual(0);
    expect(data.getCellValue(snapshot, 0, 0)).toEqual(undefined);
    expect(data.getCellFormat(snapshot, 0, 0)).toEqual(undefined);

    const rowMapping = data.getRowItemOffsetMapping(snapshot);
    expect(rowMapping.itemOffset(0)).toEqual(0);

    const columnMapping = data.getColumnItemOffsetMapping(snapshot);
    expect(columnMapping.itemOffset(0)).toEqual(0);
  })

  it('should implement SetCellValueAndFormat', () => {
    const data = new SimpleSpreadsheetData;
    expect(data.setCellValueAndFormat(0, 0, "In A1", undefined).isOk()).toEqual(true);
    expect(data.setCellValueAndFormat(0, 1, 42, "YYYY-MM-DD").isOk()).toEqual(true);
    const snapshot = data.getSnapshot();
    expect(data.getRowCount(snapshot)).toEqual(1);
    expect(data.getColumnCount(snapshot)).toEqual(2);
    expect(data.getCellValue(snapshot, 0, 0)).toEqual("In A1");
    expect(data.getCellFormat(snapshot, 0, 0)).toEqual(undefined);
    expect(data.getCellValue(snapshot, 0, 1)).toEqual(42);
    expect(data.getCellFormat(snapshot, 0, 1)).toEqual("YYYY-MM-DD");
  })

  it('should support snapshot semantics', () => {
    const data = new SimpleSpreadsheetData;
    const snapshot1 = data.getSnapshot();
    const snapshot2 = data.getSnapshot();
    expect(Object.is(snapshot1, snapshot2)).toEqual(true);
    expect(data.getRowCount(snapshot1)).toEqual(0);

    expect(data.setCellValueAndFormat(0, 0, "In A1", undefined).isOk()).toEqual(true);
    const snapshot3 = data.getSnapshot();
    expect(Object.is(snapshot2, snapshot3)).toEqual(false);
    expect(data.getRowCount(snapshot1)).toEqual(0);
    expect(data.getRowCount(snapshot3)).toEqual(1);
  })

  it('should support subscribe semantics', () => {
    const data = new SimpleSpreadsheetData;

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
