import type { SpreadsheetData } from './SpreadsheetData'

export function spreadsheetDataInterfaceTests(creator: () => SpreadsheetData<unknown>, startsEmpty=true, initialNotify=0) {
describe('SpreadsheetData Interface', () => {
  it.runIf(startsEmpty)('should start out empty', () => {
    const data = creator();
    const snapshot = data.getSnapshot();
    const loadStatus = data.getLoadStatus(snapshot);
    expect(loadStatus.isOk()).toEqual(true);
    expect(data.getRowCount(snapshot)).toEqual(0);
    expect(data.getColumnCount(snapshot)).toEqual(0);
    expect(data.getCellValue(snapshot, 0, 0)).toEqual(undefined);
    expect(data.getCellFormat(snapshot, 0, 0)).toEqual(undefined);

    const rowMapping = data.getRowItemOffsetMapping(snapshot);
    expect(rowMapping.itemOffset(0)).toEqual(0);

    const columnMapping = data.getColumnItemOffsetMapping(snapshot);
    expect(columnMapping.itemOffset(0)).toEqual(0);
  })

  it('should implement SetCellValueAndFormat', async () => {
    const data = creator();
    expect((await data.setCellValueAndFormat(0, 0, "In A1", undefined)).isOk()).toEqual(true);
    expect((await data.setCellValueAndFormat(0, 1, 42, "YYYY-MM-DD")).isOk()).toEqual(true);
    const snapshot = data.getSnapshot();
    if (startsEmpty) {
      expect(data.getRowCount(snapshot)).toEqual(1);
      expect(data.getColumnCount(snapshot)).toEqual(2);
    }
    expect(data.getCellValue(snapshot, 0, 0)).toEqual("In A1");
    expect(data.getCellFormat(snapshot, 0, 0)).toEqual(undefined);
    expect(data.getCellValue(snapshot, 0, 1)).toEqual(42);
    expect(data.getCellFormat(snapshot, 0, 1)).toEqual("YYYY-MM-DD");
  })

  it('should implement isValidCellValueAndFormat', () => {
    const data = creator();
    expect(data.isValidCellValueAndFormat(0, 0, "In A1", undefined).isOk()).toEqual(true);
    expect(data.isValidCellValueAndFormat(0, 1, 42, "YYYY-MM-DD").isOk()).toEqual(true);
  })

  it('should support snapshot semantics', async () => {
    const data = creator();
    const snapshot1 = data.getSnapshot();
    const snapshot2 = data.getSnapshot();
    expect(Object.is(snapshot1, snapshot2)).toEqual(true);
    if (startsEmpty)
      expect(data.getRowCount(snapshot1)).toEqual(0);

    expect((await data.setCellValueAndFormat(0, 0, "In A1", undefined)).isOk()).toEqual(true);
    const snapshot3 = data.getSnapshot();
    expect(Object.is(snapshot2, snapshot3)).toEqual(false);
    if (startsEmpty) {
      expect(data.getRowCount(snapshot1)).toEqual(0);
      expect(data.getRowCount(snapshot3)).toEqual(1);
    }
  })

  it('should support subscribe semantics', async () => {
    const data = creator();

    const mock = vi.fn();
    const unsubscribe = data.subscribe(mock);

    await data.setCellValueAndFormat(0, 0, "In A1", undefined);
    // Any notifications during initialization + setCellValue
    expect(mock).toBeCalledTimes(initialNotify+1);

    await data.setCellValueAndFormat(0, 0, 42, undefined);
    expect(mock).toBeCalledTimes(initialNotify+2);

    unsubscribe();
    await data.setCellValueAndFormat(0, 0, false, undefined);
    expect(mock).toBeCalledTimes(initialNotify+2);
  })
})
}
