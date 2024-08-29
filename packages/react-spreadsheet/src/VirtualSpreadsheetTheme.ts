/**
 * Theme that defines class names for all DOM elements within {@link VirtualSpreadsheet}. Provide an appropriate
 * theme to use VirtualSpreadsheet with whatever CSS management system you prefer.
 */
export interface VirtualSpreadsheetTheme {
  className: string,
  name: string,
  formula: string,
  grid: string,
  columnHeader: string,
  column: string,
  rowHeader: string,
  row: string,
  cell: string
}

export const VirtualSpreadsheetDefaultTheme: VirtualSpreadsheetTheme = {
  className: "VirtualSpreadsheet",
  name: "VirtualSpreadsheet-Name",
  formula: "VirtualSpreadsheet-Formula",
  grid: "VirtualSpreadsheet-Grid",
  rowHeader: "VirtualSpreadsheet-RowHeader",
  row: "VirtualSpreadsheet-Row",
  columnHeader: "VirtualSpreadsheet-ColumnHeader",
  column: "VirtualSpreadsheet-Column",
  cell: "VirtualSpreadsheet-Cell",
}
