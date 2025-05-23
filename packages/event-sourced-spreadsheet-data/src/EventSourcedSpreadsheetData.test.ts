import { EventSourcedSpreadsheetData } from './EventSourcedSpreadsheetData'
import { SpreadsheetData } from '@candidstartup/infinisheet-types'
import { SimpleEventLog } from '@candidstartup/simple-spreadsheet-data'
import { SpreadsheetLogEntry } from './SpreadsheetLogEntry';

function tasksProcessed(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve);
  })
}

function subscribeFired(data: SpreadsheetData<unknown>): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = data.subscribe(() => {
      unsubscribe();
      resolve();
    })
  })
}

describe('EventSourcedSpreadsheetData', () => {
  it('should start out empty', () => {
    const data = new EventSourcedSpreadsheetData(new SimpleEventLog<SpreadsheetLogEntry>);
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
    const data = new EventSourcedSpreadsheetData(new SimpleEventLog<SpreadsheetLogEntry>);
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

  it('should implement isValidCellValueAndFormat', () => {
    const data = new EventSourcedSpreadsheetData(new SimpleEventLog);
    expect(data.isValidCellValueAndFormat(0, 0, "In A1", undefined).isOk()).toEqual(true);
    expect(data.isValidCellValueAndFormat(0, 1, 42, "YYYY-MM-DD").isOk()).toEqual(true);
  })

  it('should support snapshot semantics', () => {
    const data = new EventSourcedSpreadsheetData(new SimpleEventLog<SpreadsheetLogEntry>);
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

  it('should support subscribe semantics', async () => {
    const data = new EventSourcedSpreadsheetData(new SimpleEventLog<SpreadsheetLogEntry>);

    const mock = vi.fn();
    const unsubscribe = data.subscribe(mock);

    data.setCellValueAndFormat(0, 0, "In A1", undefined);
    await tasksProcessed();
    expect(mock).toBeCalledTimes(1);

    data.setCellValueAndFormat(0, 0, 42, undefined);
    await tasksProcessed();
    expect(mock).toBeCalledTimes(2);

    unsubscribe();
    data.setCellValueAndFormat(0, 0, false, undefined);
    await tasksProcessed();
    expect(mock).toBeCalledTimes(2);
  })

  it('should load from event log', async () => {
    const log = new  SimpleEventLog<SpreadsheetLogEntry>;
    for (let i = 0; i < 20; i ++) {
      const result = await log.addEntry({ type: 'SetCellValueAndFormat', row: i, column: 0, value: i}, BigInt(i));
      expect(result.isOk()).toEqual(true);
    }
    const data = new EventSourcedSpreadsheetData(log);

    const snapshot1 = data.getSnapshot();
    expect(data.getRowCount(snapshot1)).toEqual(0);

    await subscribeFired(data);
    const snapshot2 = data.getSnapshot();
    expect(data.getRowCount(snapshot1)).toEqual(0);
    expect(data.getRowCount(snapshot2)).toEqual(10);
    expect(data.getCellValue(snapshot1, 9, 0)).toEqual(undefined);
    expect(data.getCellValue(snapshot2, 9, 0)).toEqual(9);

    await tasksProcessed();
    const snapshot3 = data.getSnapshot();
    expect(data.getRowCount(snapshot1)).toEqual(0);
    expect(data.getCellValue(snapshot1, 9, 0)).toEqual(undefined);
    expect(data.getRowCount(snapshot2)).toEqual(10);
    expect(data.getCellValue(snapshot2, 19, 0)).toEqual(undefined);
    expect(data.getRowCount(snapshot3)).toEqual(20);
    expect(data.getCellValue(snapshot3, 19, 0)).toEqual(19);
  })
})
