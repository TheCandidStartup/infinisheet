import { EmptySpreadsheetData, CellValue, rowColCoordsToRef } from '@candidstartup/react-spreadsheet';
import { useFixedSizeItemOffsetMapping, ItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

const columnItemOffsetMapping = useFixedSizeItemOffsetMapping(160);

export class CellRefData extends EmptySpreadsheetData {
  getRowCount(_snapshot: number) { return 1000000000; }
  getColumnCount(_snapshot: number) { return 1000000000; }
  getColumnItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return columnItemOffsetMapping; }
  getCellValue(_snapshot: number, row: number, column: number): CellValue {
    return rowColCoordsToRef(row, column); 
  }
}