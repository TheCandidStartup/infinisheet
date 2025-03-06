import { EmptySpreadsheetData, CellValue } from '@candidstartup/infinisheet-types';
import { ItemOffsetMapping, useVariableSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';
import { dateToSerial } from 'numfmt'

const headerRow = [ "Date", "Time", "Item", "Price", "Quantity", "Cost", "Tax Rate", "Tax", "Subtotal", "Transaction Fee", "Total", "Running Total"];
const totalHeaderRow = [ "First", "Last", "Count", "Average", "Max", "Total", "Min", "Total", "Total", "Total", "Total", "Running Total"]
const columnMapping = useVariableSizeItemOffsetMapping(100, [160]);
const rowMapping = useVariableSizeItemOffsetMapping(30, [50]);

export class BoringData extends EmptySpreadsheetData {
  constructor() { 
    super();
    this.count = 1000000;
    const now = new Date();
    const serialNow = dateToSerial(now) || 0;
    this.base = serialNow - this.count / (24*60);
  }

  subscribe(onDataChange: () => void) {
    const intervalId = setInterval(() => { 
      this.count ++;
      onDataChange();
    }, 60000)
    return () => { clearInterval(intervalId) }
  }

  getSnapshot() { return this.count; }
  
  getRowCount(snapshot: number) { return snapshot+4; }
  getRowItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return rowMapping; }
  getColumnCount(_snapshot: number) { return 12; }
  getColumnItemOffsetMapping(_snapshot: number): ItemOffsetMapping { return columnMapping; }

  dateTime(row: number) { return this.base + row / (24*60); }

  totalRow(num: number, column: number): CellValue {
    switch (column) { 
      case 0: return this.dateTime(1);
      case 1: return this.dateTime(num);
      case 2: return num;
      case 3: return 0.01;
      case 4: return 80;
      case 5: return 0.80 * num;
      case 6: return 0.15;
      case 7: return 0.12 * num;
      case 8: return 0.92 * num;
      case 9: return 0.08 * num;
      case 10: return num;
      case 11: return num;
    }
  }

  getCellValue(snapshot: number, row: number, column: number): CellValue {
    if (row == 0)
      return headerRow[column];

    if (row == snapshot + 1)
      return undefined;
    if (row == snapshot + 2)
      return totalHeaderRow[column];
    
    if (row == snapshot + 3)
      return this.totalRow(snapshot, column);

    if (row > snapshot)
      return undefined;

    const dateTime = this.dateTime(row);
    switch (column) { 
      case 0: return dateTime;
      case 1: return dateTime;
      case 2: return "Nails";
      case 3: return 0.01;
      case 4: return 80;
      case 5: return 0.80;
      case 6: return 0.15;
      case 7: return 0.12;
      case 8: return 0.92;
      case 9: return 0.08;
      case 10: return 1.00;
      case 11: return row;
    }
  }
  getCellFormat(snapshot: number, row: number, column: number) { 
    if (row == snapshot + 3 && column == 1)
      return "yyyy-mm-dd";

    switch (column) {
      case 0:
        return "yyyy-mm-dd";
      case 1:
        return "hh:mm";
      case 6:
        return "0%";
      case 3:
      case 5:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
        return "$0.00";
      default:
        return undefined; 
    }
  }

  count: number;
  base: number;
}