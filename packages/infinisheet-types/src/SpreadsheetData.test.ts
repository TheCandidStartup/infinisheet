import { cellRangeCoords } from './RowColRef';
import { EmptySpreadsheetData, viewport, equalViewports, emptyViewport, isEmptyViewport, viewportToCellRange } from './SpreadsheetData'

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

    expect(data.getViewport(0)).toEqual(undefined);
    data.setViewport(viewport(0,1,2,3));
    expect(equalViewports(data.getViewport(1), viewport(0,1,2,3))).toEqual(true);

    // Callback function will never be called. Hard and pointless to test
    const unsubscribe = data.subscribe(() => {});
    unsubscribe();
  })
})

describe('SpreadsheetViewport', () => {
  it('viewport', () => {
    const v1 = viewport(0,1,2,3);

    expect(v1.rowMinOffset).toEqual(0);
    expect(v1.columnMinOffset).toEqual(1);
    expect(v1.width).toEqual(2);
    expect(v1.height).toEqual(3);
  })

  it('equalViewports', () => {
    const v1 = viewport(0,1,2,3);
    const v2 = viewport(0,1,2,3);
    const v3 = viewport(0,1,2,4);

    expect(equalViewports(v1,v1)).toEqual(true);
    expect(equalViewports(v1,v2)).toEqual(true);
    expect(equalViewports(v1,v3)).toEqual(false);
    expect(equalViewports(v1,undefined)).toEqual(false);
    expect(equalViewports(undefined, v1)).toEqual(false);
    expect(equalViewports(undefined, undefined)).toEqual(true);
  })

  it('emptyViewport', () => {
    const v1 = viewport(0,1,2,3);
    const v2 = emptyViewport();
    const v3 = viewport(0,1,0,3);
    const v4 = viewport(0,1,3,0);

    expect(v2.width).toEqual(0);
    expect(v2.height).toEqual(0);
    expect(isEmptyViewport(v1)).toEqual(false);
    expect(isEmptyViewport(v2)).toEqual(true);
    expect(isEmptyViewport(v3)).toEqual(true);
    expect(isEmptyViewport(v4)).toEqual(true);
    expect(v1.rowMinOffset).toEqual(0);
    expect(v1.columnMinOffset).toEqual(1);
    expect(v1.width).toEqual(2);
    expect(v1.height).toEqual(3);
  })

  it('viewportToCellRange', () => {
    const data = new EmptySpreadsheetData;
    const v1 = viewport(0,1,2,3);
    const v2 = emptyViewport();
    const v3 = viewport(0,0,100,30);
    const v4 = viewport(0,0,500,1000);
    const v5 = viewport(300,400,1000,2000);

    expect(viewportToCellRange(data, 0, v1)).toEqual(cellRangeCoords(0,0,0,0));
    expect(viewportToCellRange(data, 0, v2)).toEqual(null);
    expect(viewportToCellRange(data, 0, v3)).toEqual(cellRangeCoords(0,0,0,0));
    expect(viewportToCellRange(data, 0, v4)).toEqual(cellRangeCoords(0,0,33,4));
    expect(viewportToCellRange(data, 0, v5)).toEqual(cellRangeCoords(10,4,76,13));
  })
})
