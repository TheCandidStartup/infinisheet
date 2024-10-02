/**
 * Theme that defines class names for all DOM elements within {@link VirtualSpreadsheet}. Provide an appropriate
 * theme to use VirtualSpreadsheet with whatever CSS management system you prefer.
 */
export interface VirtualSpreadsheetTheme {
  VirtualSpreadsheet: string,
  VirtualSpreadsheet_Name: string,
  VirtualSpreadsheet_Formula: string,
  VirtualSpreadsheet_Grid: string,
  VirtualSpreadsheet_ColumnHeader: string,
  VirtualSpreadsheet_Column: string,
  VirtualSpreadsheet_RowHeader: string,
  VirtualSpreadsheet_Row: string,
  VirtualSpreadsheet_Cell: string,
  VirtualSpreadsheet_Cell__Focus: string
}

export const VirtualSpreadsheetDefaultTheme: VirtualSpreadsheetTheme = {
  VirtualSpreadsheet: "VirtualSpreadsheet",
  VirtualSpreadsheet_Name: "VirtualSpreadsheet_Name",
  VirtualSpreadsheet_Formula: "VirtualSpreadsheet_Formula",
  VirtualSpreadsheet_Grid: "VirtualSpreadsheet_Grid",
  VirtualSpreadsheet_ColumnHeader: "VirtualSpreadsheet_ColumnHeader",
  VirtualSpreadsheet_Column: "VirtualSpreadsheet_Column",
  VirtualSpreadsheet_RowHeader: "VirtualSpreadsheet_RowHeader",
  VirtualSpreadsheet_Row: "VirtualSpreadsheet_Row",
  VirtualSpreadsheet_Cell: "VirtualSpreadsheet_Cell",
  VirtualSpreadsheet_Cell__Focus: "VirtualSpreadsheet_Cell__Focus"
}
