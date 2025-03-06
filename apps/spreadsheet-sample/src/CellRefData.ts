import { EmptySpreadsheetData, CellValue, rowColCoordsToRef } from '@candidstartup/infinisheet-types';
import { useFixedSizeItemOffsetMapping, ItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

const columnItemOffsetMapping = useFixedSizeItemOffsetMapping(160);

export class CellRefData extends EmptySpreadsheetData {
  getRowCount(_snapshot: number) { return 1000000000; }
  getColumnCount(_snapshot: number) { return 1000000000; }
  getColumnItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return columnItemOffsetMapping; }
  getCellValue(snapshot: number, row: number, column: number): CellValue {
    if (row >= this.getRowCount(snapshot) || column >= this.getColumnCount(snapshot))
      return undefined;

    return rowColCoordsToRef(row, column); 
  }
}