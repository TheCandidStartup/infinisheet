import { render, screen,  } from '../../../shared/test/wrapper'
import { stubProperty, unstubAllProperties } from '../../../shared/test/utils'

import { VirtualSpreadsheet } from './VirtualSpreadsheet'
import { VirtualSpreadsheetDefaultTheme } from './VirtualSpreadsheetTheme'
import { EmptySpreadsheetData, CellValue, rowColCoordsToRef } from '@candidstartup/infinisheet-types';

class TestData extends EmptySpreadsheetData {
  getRowCount(_snapshot: number) { return 100; }
  getColumnCount(_snapshot: number) { return 26; }
  getCellValue(_snapshot: number, row: number, column: number): CellValue {
    switch (column) { 
      case 2:
        return row;
      case 3:
        return row;
      case 4:
        return (row <= 1) ? (row % 2) == 0 : null;
      case 5:
        return (row == 0) ? "'apostrophe" : undefined;
      case 6:
        return (row == 0) ? { type: 'CellError', value: '#NULL!'} : "";
      default:
        return rowColCoordsToRef(row, column); 
    }
  }
  getCellFormat(_snapshot: number, _row: number, column: number) { 
    switch (column) { 
      case 2:
        return "0.00";
      case 3:
        return "yyyy-mm-dd";
      default:
        return undefined; 
    }
  }
}

const data = new TestData;

describe('VirtualSpreadsheet', () => {
  beforeEach(() => {
    const mock = vi.fn();
    Element.prototype["scrollTo"] = mock;
  })
  afterEach(() => {
    unstubAllProperties();
    Reflect.deleteProperty(Element.prototype, "scrollTo");
  })

  it('should render with no theme or class name', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);

    render(
      <VirtualSpreadsheet
        data={data}
        height={240}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('A1')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).not.toHaveProperty("class");
  })

  it('should render with class name', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        className={"Testy"}
        height={240}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('A1')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).toHaveProperty("className", "Testy");
  })

  it('should render with default theme', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        theme={VirtualSpreadsheetDefaultTheme}
        height={240}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('A1')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).toHaveProperty("className", "VirtualSpreadsheet");
  })

  it('should render with class name and theme', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        className={"Testy"}
        theme={VirtualSpreadsheetDefaultTheme}
        height={240}
        width={600}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('A1')
    expect(cell).toBeInTheDocument()
    const spreadsheet = document.querySelector("div div");
    expect(spreadsheet).toHaveProperty("className", "Testy VirtualSpreadsheet");
  })

  it('should render formatted cells', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 985);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        height={240}
        width={1000}>
      </VirtualSpreadsheet>
    )
    const cell = screen.getByText('A1')
    expect(cell).toBeInTheDocument()
    const num = screen.getByText('0.00')
    expect(num).toBeInTheDocument()
    const date = screen.getByText('1900-01-01')
    expect(date).toBeInTheDocument()
    const bool = screen.getByText('TRUE');
    expect(bool).toBeInTheDocument();
    const str = screen.getByText('apostrophe');
    expect(str).toBeInTheDocument();
    const err = screen.getByText('#NULL!');
    expect(err).toBeInTheDocument();
  })
})