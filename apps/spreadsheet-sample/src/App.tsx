import { VirtualSpreadsheet, SpreadsheetData, CellValue, rowColCoordsToRef } from '@candidstartup/react-spreadsheet';
import theme from '@candidstartup/react-spreadsheet/VirtualSpreadsheet.module.css';
import './App.css';

class AppData implements SpreadsheetData<number> {
  constructor() { this.count = 0; }

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
        return row;
      case 2:
        return row;
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

const data = new AppData;

export function App() {
  return (
    <VirtualSpreadsheet
    data={data}
    theme={theme}
    height={240}
    maxRowCount={1000000}
    maxColumnCount={100}
    width={600}>
  </VirtualSpreadsheet>
  )
}
