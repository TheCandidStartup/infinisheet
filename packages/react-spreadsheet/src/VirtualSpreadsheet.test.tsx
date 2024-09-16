import { render, screen } from '../../../shared/test/wrapper'

import { VirtualSpreadsheet } from './VirtualSpreadsheet'
import { VirtualSpreadsheetDefaultTheme } from './VirtualSpreadsheetTheme'
import type { SpreadsheetData } from './SpreadsheetData';
import { rowColCoordsToRef } from './RowColRef';

class TestData implements SpreadsheetData<number> {
  subscribe(_onDataChange: () => void) {
    return () => {};
  }

  getSnapshot() { return 0; }
  
  getRowCount(_snapshot: number) { return 100; }
  getColumnCount(_snapshot: number) { return 26; }
  getCellValue(_snapshot: number, row: number, column: number) { 
    return rowColCoordsToRef(row, column); 
  }
}

const data = new TestData;

describe('VirtualSpreadsheet', () => {

  it('should render with no theme or class name', () => {
    render(
      <VirtualSpreadsheet
        data={data}
        height={240}
        minRowCount={100}
        minColumnCount={26}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('A1')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).not.toHaveProperty("class");
  })

  it('should render with class name', () => {
    render(
      <VirtualSpreadsheet
        data={data}
        className={"Testy"}
        height={240}
        minRowCount={100}
        minColumnCount={26}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('A1')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).toHaveProperty("className", "Testy");
  })

  it('should render with default theme', () => {
    render(
      <VirtualSpreadsheet
        data={data}
        theme={VirtualSpreadsheetDefaultTheme}
        height={240}
        minRowCount={100}
        minColumnCount={26}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('A1')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).toHaveProperty("className", "VirtualSpreadsheet");
  })

  it('should render with class name and theme', () => {
    render(
      <VirtualSpreadsheet
        data={data}
        className={"Testy"}
        theme={VirtualSpreadsheetDefaultTheme}
        height={240}
        minRowCount={100}
        minColumnCount={26}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('A1')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).toHaveProperty("className", "Testy VirtualSpreadsheet");
  })
})