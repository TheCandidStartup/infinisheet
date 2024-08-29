import { render, screen } from '../../../shared/test/wrapper'

import { VirtualSpreadsheet } from './VirtualSpreadsheet'
import { VirtualSpreadsheetDefaultTheme } from './VirtualSpreadsheetTheme'

describe('VirtualSpreadsheet', () => {

  it('should render with no theme or class name', () => {
    render(
      <VirtualSpreadsheet
        height={240}
        minRowCount={100}
        minColumnCount={26}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('0:0')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).not.toHaveProperty("class");
  })

  it('should render with class name', () => {
    render(
      <VirtualSpreadsheet
        className={"Testy"}
        height={240}
        minRowCount={100}
        minColumnCount={26}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('0:0')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).toHaveProperty("className", "Testy");
  })

  it('should render with default theme', () => {
    render(
      <VirtualSpreadsheet
        theme={VirtualSpreadsheetDefaultTheme}
        height={240}
        minRowCount={100}
        minColumnCount={26}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('0:0')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).toHaveProperty("className", "VirtualSpreadsheet");
  })

  it('should render with class name and theme', () => {
    render(
      <VirtualSpreadsheet
        className={"Testy"}
        theme={VirtualSpreadsheetDefaultTheme}
        height={240}
        minRowCount={100}
        minColumnCount={26}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('0:0')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).toHaveProperty("className", "Testy VirtualSpreadsheet");
  })
})