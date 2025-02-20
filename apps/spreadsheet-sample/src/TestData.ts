import { EmptySpreadsheetData, CellValue, rowColCoordsToRef } from '@candidstartup/infinisheet-types';

export class TestData extends EmptySpreadsheetData {
  constructor() { super(); this.count = 100; }

  subscribe(onDataChange: () => void) {
    const intervalId = setInterval(() => { 
      this.count ++;
      onDataChange();
    }, 1000)
    return () => { clearInterval(intervalId) }
  }

  getSnapshot() { return this.count; }
  
  getRowCount(snapshot: number) { return snapshot; }
  getColumnCount(_snapshot: number) { return 26; }
  getCellValue(_snapshot: number, row: number, column: number): CellValue {
    switch (column) { 
      case 1:
        return row-10;
      case 2:
        return row-10;
      case 3:
        return (row % 2) == 0;
      case 4:
        return "'apostrophe";
      case 5:
        return { type: 'CellError', value: '#NULL!'};
      default:
        return rowColCoordsToRef(row, column); 
    }
  }
  getCellFormat(_snapshot: number, _row: number, column: number) { 
    switch (column) { 
      case 1:
        return "0.00";
      case 2:
        return "yyyy-mm-dd";
      default:
        return undefined; 
    }
  }

  count: number;
}