import { VirtualSpreadsheet, VirtualSpreadsheetDefaultTheme as theme } from '@candidstartup/react-spreadsheet';
import '@candidstartup/react-spreadsheet/VirtualSpreadsheet.css';
import './App.css';
import { BoringData } from './BoringData';

const data = new BoringData;

export function App() {
  return (
    <VirtualSpreadsheet
    data={data}
    theme={theme}
    height={380}
    width={700}>
  </VirtualSpreadsheet>
  )
}
