import { EmptySpreadsheetData } from './SpreadsheetData'

describe('EmptySpreadsheetData', () => {
  it('should have hardcoded values', async () => {
    const data = new EmptySpreadsheetData;
    expect(data.getSnapshot()).toEqual(0);
    const loadStatus = data.getLoadStatus(0);
    expect(loadStatus.isOk()).toEqual(true);
    expect(loadStatus._unsafeUnwrap()).toEqual(true);
    expect(data.getRowCount(0)).toEqual(0);
    expect(data.getColumnCount(0)).toEqual(0);
    expect(data.getCellValue(0, 0, 0)).toEqual(null);
    expect(data.getCellFormat(0, 0, 0)).toEqual(undefined);
    expect((await data.setCellValueAndFormat(0, 0, null, undefined)).isOk()).toEqual(false);
    expect(data.isValidCellValueAndFormat(0, 0, null, undefined).isOk()).toEqual(true);

    const rowMapping = data.getRowItemOffsetMapping(0);
    expect(rowMapping.itemOffset(0)).toEqual(0);

    const columnMapping = data.getColumnItemOffsetMapping(0);
    expect(columnMapping.itemOffset(0)).toEqual(0);

    // Callback function will never be called. Hard and pointless to test
    const unsubscribe = data.subscribe(() => {});
    unsubscribe();
  })
})
