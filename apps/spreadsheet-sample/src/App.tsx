import { VirtualSpreadsheet, SpreadsheetData, rowColCoordsToRef/*, VirtualSpreadsheetDefaultTheme as theme*/ } from '@candidstartup/react-spreadsheet';

//import '@candidstartup/react-spreadsheet/VirtualSpreadsheet.css';
import theme from '@candidstartup/react-spreadsheet/VirtualSpreadsheet.module.css';

import './App.css';

class AppData implements SpreadsheetData {
  constructor() { this.count = 0; }

  subscribe(onDataChange: () => void) {
    const intervalId = setInterval(() => { 
      this.count ++;
      onDataChange();
    }, 1000)
    return () => { clearInterval(intervalId) }
  }

  getSnapshot() { return this.count; }
  
  getRowCount() { return this.count; }
  getColumnCount() { return 26; }
  getCellValue(_snapshot: number, row: number, column: number) { 
    return rowColCoordsToRef(row, column); 
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
    maxRowCount={1000}
    maxColumnCount={1000}
    width={600}>
  </VirtualSpreadsheet>
  )
}
