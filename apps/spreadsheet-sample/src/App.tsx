import { VirtualSpreadsheet/*, VirtualSpreadsheetDefaultTheme as theme*/ } from '@candidstartup/react-spreadsheet';

//import '@candidstartup/react-spreadsheet/VirtualSpreadsheet.css';
import theme from '@candidstartup/react-spreadsheet/VirtualSpreadsheet.module.css';

import './App.css';

export function App() {
  return (
    <VirtualSpreadsheet
    theme={theme}
    height={240}
    minRowCount={100}
    minColumnCount={26}
    width={600}>
  </VirtualSpreadsheet>
  )
}
