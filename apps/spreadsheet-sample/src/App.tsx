import { VirtualSpreadsheet } from '@candidstartup/react-spreadsheet';
import theme from '@candidstartup/react-spreadsheet/VirtualSpreadsheet.module.css';
import './App.css';
import { BoringData } from './BoringData';

const data = new BoringData;

export function App() {
  return (
    <VirtualSpreadsheet
    data={data}
    theme={theme}
    height={300}
    minColumnCount={0}
    width={600}>
  </VirtualSpreadsheet>
  )
}
