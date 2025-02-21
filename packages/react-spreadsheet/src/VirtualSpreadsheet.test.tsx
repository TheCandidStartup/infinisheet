import { render, screen, fireEvent, act } from '../../../shared/test/wrapper'
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

function expectClassName(element: HTMLElement, name: string) {
  const className = element.className;
  const names = className.split(" ");
  expect(names).toContain(name);
}

const setCellValueAndFormatMock = vi.fn();
const data = new TestData;
data.setCellValueAndFormat = setCellValueAndFormatMock;

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

  it('should support click to select', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        theme={VirtualSpreadsheetDefaultTheme}
        height={320}
        width={700}>
      </VirtualSpreadsheet>
    )

    const cell = screen.getByText('A1')
    const row = screen.getByText('1', { exact: true });
    const col = screen.getByText('A', { exact: true });

    {act(() => {
      fireEvent.click(cell);
    })}
    const name = screen.getByTitle("Name");
    const formula = screen.getByTitle("Formula");
    expect(name).toHaveProperty("value", "A1");
    expect(formula).toHaveProperty("value", "A1");
    expect(cell).toHaveProperty("className", "VirtualSpreadsheet_Cell VirtualSpreadsheet_Cell__Type_string VirtualSpreadsheet_Cell__Focus");
    expect(row).toHaveProperty("className", "VirtualSpreadsheet_Row VirtualSpreadsheet_Row__CellSelected");
    expect(col).toHaveProperty("className", "VirtualSpreadsheet_Column VirtualSpreadsheet_Column__CellSelected");

    {act(() => {
      fireEvent.click(row);
    })}
    expect(name).toHaveProperty("value", "1");
    expect(formula).toHaveProperty("value", "A1");
    expect(cell).toHaveProperty("className", "VirtualSpreadsheet_Cell VirtualSpreadsheet_Cell__RowSelected VirtualSpreadsheet_Cell__Type_string VirtualSpreadsheet_Cell__Focus");
    expect(row).toHaveProperty("className", "VirtualSpreadsheet_Row VirtualSpreadsheet_Row__Selected");
    expect(col).toHaveProperty("className", "VirtualSpreadsheet_Column VirtualSpreadsheet_Column__CellSelected");


    {act(() => {
      fireEvent.click(col);
    })}
    expect(name).toHaveProperty("value", "A");
    expect(formula).toHaveProperty("value", "A1");
    expect(cell).toHaveProperty("className", "VirtualSpreadsheet_Cell VirtualSpreadsheet_Cell__ColumnSelected VirtualSpreadsheet_Cell__Type_string VirtualSpreadsheet_Cell__Focus");
    expect(row).toHaveProperty("className", "VirtualSpreadsheet_Row VirtualSpreadsheet_Row__CellSelected");
    expect(col).toHaveProperty("className", "VirtualSpreadsheet_Column VirtualSpreadsheet_Column__Selected");
  })

  it('should support select by name', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        theme={VirtualSpreadsheetDefaultTheme}
        height={320}
        width={700}>
      </VirtualSpreadsheet>
    )

    const name = screen.getByTitle("Name");
    {act(() => {
      fireEvent.change(name, { target: { value: "A2" }})
      fireEvent.keyUp(name, { key: 'Enter'})
    })}

    const formula = screen.getByTitle("Formula");
    expect(formula).toHaveProperty("value", "A2");
    const cell = screen.getByText('A2');
    expectClassName(cell, "VirtualSpreadsheet_Cell__Focus");

    {act(() => {
      fireEvent.change(name, { target: { value: "A100" }})
      fireEvent.keyUp(name, { key: 'Enter'})
    })}
    expect(formula).toHaveProperty("value", "A100");
    const cell100 = screen.getByText('A100');
    expectClassName(cell100, "VirtualSpreadsheet_Cell__Focus");
  })

  it('should support keyboard navigation', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        theme={VirtualSpreadsheetDefaultTheme}
        height={320}
        width={700}>
      </VirtualSpreadsheet>
    )

    const name = screen.getByTitle("Name");
    const formula = screen.getByTitle("Formula");
    {act(() => {
      fireEvent.change(name, { target: { value: "A2" }})
      fireEvent.keyUp(name, { key: 'Enter'})
    })}

    // Moving left from first column does nothing
    const focusSink = screen.getByTitle("Edit");
    {act(() => { fireEvent.keyDown(focusSink, { key: 'ArrowLeft' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "A2");
    expect(formula).toHaveProperty("value", "A2");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'ArrowDown' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "A3");
    expect(formula).toHaveProperty("value", "A3");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'ArrowRight' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "B3");
    expect(formula).toHaveProperty("value", "B3");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'ArrowRight' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "C3");
    expect(formula).toHaveProperty("value", "2.00");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'ArrowUp' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "C2");
    expect(formula).toHaveProperty("value", "1.00");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'ArrowLeft' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "B2");
    expect(formula).toHaveProperty("value", "B2");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'Tab' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "C2");
    expect(formula).toHaveProperty("value", "1.00");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'Tab', shiftKey: true }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "B2");
    expect(formula).toHaveProperty("value", "B2");

    // Tab and Enter should move within row selection
    const row = screen.getByText('1', { exact: true });
    {act(() => {
      fireEvent.click(row);
    })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "1");
    expect(formula).toHaveProperty("value", "A1");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'Tab' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "1");
    expect(formula).toHaveProperty("value", "B1");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'Enter' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "1");
    expect(formula).toHaveProperty("value", "0.00");

    // Tab and Enter should move within column selection
    const col = screen.getByText('A', { exact: true });
    {act(() => {
      fireEvent.click(col);
    })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "A");
    expect(formula).toHaveProperty("value", "A1");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'Tab' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "A");
    expect(formula).toHaveProperty("value", "A2");

    {act(() => { fireEvent.keyDown(focusSink, { key: 'Enter' }) })}
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "A");
    expect(formula).toHaveProperty("value", "A3");
  })

  it('should support keyboard edit', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        theme={VirtualSpreadsheetDefaultTheme}
        height={320}
        width={700}>
      </VirtualSpreadsheet>
    )

    const name = screen.getByTitle("Name");
    const formula = screen.getByTitle("Formula");
    {act(() => {
      fireEvent.change(name, { target: { value: "A2" }})
      fireEvent.keyUp(name, { key: 'Enter'})
    })}

    // Go into edit mode by hitting enter on focus cell
    const focusSink = screen.getByTitle("Edit");
    {act(() => { fireEvent.keyDown(focusSink, { key: 'Enter' }) })}
    expect(name).toHaveProperty("value", "A2");
    expect(formula).toHaveProperty("value", "A2");
    expect(focusSink).toHaveProperty("value", "A2");

    // Formula responds as you type
    {act(() => {
      fireEvent.change(focusSink, { target: { value: "changed" }})
    })}
    expect(focusSink).toHaveProperty("value", "changed");
    expect(name).toHaveProperty("value", "A2");
    expect(formula).toHaveProperty("value", "changed");

    // Escape reverts changes and stays on same cell
    {act(() => { fireEvent.keyDown(focusSink, { key: 'Escape' }) })}
    expect(name).toHaveProperty("value", "A2");
    expect(formula).toHaveProperty("value", "A2");
    expect(focusSink).toHaveProperty("value", "");

    // Enter tries to commit changes, moves to next cell down and leaves edit mode
    {act(() => {
      fireEvent.change(focusSink, { target: { value: "changed" }})
      fireEvent.keyDown(focusSink, { key: 'Enter' })
    })}
    expect(setCellValueAndFormatMock).lastCalledWith(1, 0, "changed", undefined)
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "A3");
    expect(formula).toHaveProperty("value", "A3");

    // Tab tries to commit changes, moves to next cell right and leaves edit mode
    {act(() => {
      fireEvent.change(focusSink, { target: { value: "changed2" }})
      fireEvent.keyDown(focusSink, { key: 'Tab' })
    })}
    expect(setCellValueAndFormatMock).lastCalledWith(2, 0, "changed2", undefined)
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "B3");
    expect(formula).toHaveProperty("value", "B3");

    // Edit cell to value with format
    {act(() => {
      fireEvent.change(focusSink, { target: { value: "12 June 1984" }})
      fireEvent.keyDown(focusSink, { key: 'Enter' })
    })}
    expect(setCellValueAndFormatMock).lastCalledWith(2, 1, 30845, "d mmmm yyyy")
    expect(focusSink).toHaveProperty("value", "");
    expect(name).toHaveProperty("value", "B4");
    expect(formula).toHaveProperty("value", "B4");
  })

  it('should support double click edit', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        theme={VirtualSpreadsheetDefaultTheme}
        height={320}
        width={700}>
      </VirtualSpreadsheet>
    )

    const name = screen.getByTitle("Name");
    const formula = screen.getByTitle("Formula");
    {act(() => {
      fireEvent.change(name, { target: { value: "A2" }})
      fireEvent.keyUp(name, { key: 'Enter'})
    })}

    // Go into edit mode by hitting enter on focus cell
    const focusSink = screen.getByTitle("Edit");
    {act(() => { fireEvent.dblClick(focusSink)})}
    expect(name).toHaveProperty("value", "A2");
    expect(formula).toHaveProperty("value", "A2");
    expect(focusSink).toHaveProperty("value", "A2");
  })

  it('should support formula edit', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        theme={VirtualSpreadsheetDefaultTheme}
        height={320}
        width={700}>
      </VirtualSpreadsheet>
    )

    // Messing with formula when nothing selected should do nothing
    const formula = screen.getByTitle("Formula");
    const name = screen.getByTitle("Name");
    {act(() => { 
      fireEvent.focus(formula);
    })}
    expect(name).toHaveProperty("value", "");
    expect(formula).toHaveProperty("value", "");

    {act(() => { 
      fireEvent.change(formula, { target: { value: "pointless" }})
      fireEvent.keyDown(formula, { key: 'Enter'})
    })}
    expect(name).toHaveProperty("value", "");
    expect(formula).toHaveProperty("value", "pointless");

    // Now select something
    {act(() => {
      fireEvent.focus(name);
      fireEvent.change(name, { target: { value: "A2" }})
      fireEvent.keyUp(name, { key: 'Enter'})
    })}
    expect(name).toHaveProperty("value", "A2");
    expect(formula).toHaveProperty("value", "A2");

    // Go into edit mode by changing focus to formula
    const focusSink = screen.getByTitle("Edit");
    {act(() => { 
      fireEvent.focus(formula);
    })}
    expect(name).toHaveProperty("value", "A2");
    expect(formula).toHaveProperty("value", "A2");
    expect(focusSink).toHaveProperty("value", "A2");

    // Change value there
    {act(() => { 
      fireEvent.change(formula, { target: { value: "changed3" }})
    })}
    expect(name).toHaveProperty("value", "A2");
    expect(formula).toHaveProperty("value", "changed3");
    expect(focusSink).toHaveProperty("value", "changed3");

    // Commit change
    {act(() => { 
      fireEvent.keyDown(formula, { key: 'Enter'})
    })}
    expect(setCellValueAndFormatMock).lastCalledWith(1, 0, "changed3", undefined)
    expect(name).toHaveProperty("value", "A3");
    expect(formula).toHaveProperty("value", "A3");
    expect(focusSink).toHaveProperty("value", "");
  })

  it('should support readOnly', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualSpreadsheet
        data={data}
        theme={VirtualSpreadsheetDefaultTheme}
        readOnly={true}
        height={320}
        width={700}>
      </VirtualSpreadsheet>
    )

    const name = screen.getByTitle("Name");
    const formula = screen.getByTitle("Formula");
    {act(() => {
      fireEvent.change(name, { target: { value: "A2" }})
      fireEvent.keyUp(name, { key: 'Enter'})
    })}

    // Hitting enter moves down rather than going into edit mode
    const focusSink = screen.getByTitle("Edit");
    {act(() => { fireEvent.keyDown(focusSink, { key: 'Enter' }) })}
    expect(name).toHaveProperty("value", "A3");
    expect(formula).toHaveProperty("value", "A3");
    expect(formula).toHaveProperty("readOnly", true);
    expect(focusSink).toHaveProperty("value", "");
    expect(focusSink).toHaveProperty("readOnly", true);
  })
})