/**
 * Theme that defines class names for all DOM elements within {@link VirtualSpreadsheet}. Provide an appropriate
 * theme to use VirtualSpreadsheet with whatever CSS management system you prefer.
 * 
 * Properties are named using a BEM style with the form `ComponentName_ElementName__modifierName_modifierValue`
 */
export interface VirtualSpreadsheetTheme {
  /** Class applied to the overall component */
  VirtualSpreadsheet: string,

  /** Class applied to the input bar at the top of the component */
  VirtualSpreadsheet_InputBar: string,

  /** Class applied to the Name input on the left end of the input bar */
  VirtualSpreadsheet_Name: string,

  /** Class applied to the "fx" label in the input bar */
  VirtualSpreadsheet_Fx: string,

  /** Class applied to the Formula input on the right end of the input bar */
  VirtualSpreadsheet_Formula: string,

  /** Modifier class applied to the Formula input when the user has entered invalid data */
  VirtualSpreadsheet_Formula__DataError: string,

  /** Class applied to the grid of cells */
  VirtualSpreadsheet_Grid: string,

  /** Class applied to the top left corner where the row and column headers meet */
  VirtualSpreadsheet_CornerHeader: string,

  /** Class applied to the column header */
  VirtualSpreadsheet_ColumnHeader: string,

  /** Class applied to an individual column within the column header */
  VirtualSpreadsheet_Column: string,

  /** Modifier class applied to a column when it's selected */
  VirtualSpreadsheet_Column__Selected: string,

  /** Modifier class applied to a column when a cell in that column is selected */
  VirtualSpreadsheet_Column__CellSelected: string,

  /** Class applied to the row header */
  VirtualSpreadsheet_RowHeader: string,

  /** Class applied to an individual row within the row header */
  VirtualSpreadsheet_Row: string,

  /** Modifier class applied to a row when it's selected */
  VirtualSpreadsheet_Row__Selected: string,

  /** Modifier class applied to a row when a cell in that row is selected */
  VirtualSpreadsheet_Row__CellSelected: string,

  /** Class applied to a cell within the grid*/ 
  VirtualSpreadsheet_Cell: string,

  /** Modifier class applied to a cell when it contains a string value */
  VirtualSpreadsheet_Cell__Type_string: string,

  /** Modifier class applied to a cell when it contains a number value */
  VirtualSpreadsheet_Cell__Type_number: string,

  /** Modifier class applied to a cell when it contains a boolean value */
  VirtualSpreadsheet_Cell__Type_boolean: string,

  /** Modifier class applied to a cell when it contains a null value */
  VirtualSpreadsheet_Cell__Type_null: string,

  /** Modifier class applied to a cell when it contains an undefined value */
  VirtualSpreadsheet_Cell__Type_undefined: string,

  /** Modifier class applied to a cell when it contains an error value */
  VirtualSpreadsheet_Cell__Type_CellError: string,

  /** Modifier class applied to a cell when it has the focus */
  VirtualSpreadsheet_Cell__Focus: string,

  /** Modifier class applied to a cell when it's within a selected row */
  VirtualSpreadsheet_Cell__RowSelected: string,

  /** Modifier class applied to a cell when it's within a selected column */
  VirtualSpreadsheet_Cell__ColumnSelected: string,

    /** Modifier class applied to a cell when an update is pending */
  VirtualSpreadsheet_Cell__UpdatePending: string,

  /** Modifier class applied to a cell when the user has entered invalid data */
  VirtualSpreadsheet_Cell__DataError: string,

  /** Class applied to an in grid error tag */
  VirtualSpreadsheet_ErrorTag: string,
}

/** Default implementation of theme provided by `VirtualSpreadsheet.css` */
export const VirtualSpreadsheetDefaultTheme: VirtualSpreadsheetTheme = {
  VirtualSpreadsheet: "VirtualSpreadsheet",
  VirtualSpreadsheet_InputBar: "VirtualSpreadsheet_InputBar",
  VirtualSpreadsheet_Name: "VirtualSpreadsheet_Name",
  VirtualSpreadsheet_Fx: "VirtualSpreadsheet_Fx",
  VirtualSpreadsheet_Formula: "VirtualSpreadsheet_Formula",
  VirtualSpreadsheet_Formula__DataError: "VirtualSpreadsheet_Formula__DataError",
  VirtualSpreadsheet_Grid: "VirtualSpreadsheet_Grid",
  VirtualSpreadsheet_CornerHeader: "VirtualSpreadsheet_CornerHeader",
  VirtualSpreadsheet_ColumnHeader: "VirtualSpreadsheet_ColumnHeader",
  VirtualSpreadsheet_Column: "VirtualSpreadsheet_Column",
  VirtualSpreadsheet_Column__Selected: "VirtualSpreadsheet_Column__Selected",
  VirtualSpreadsheet_Column__CellSelected: "VirtualSpreadsheet_Column__CellSelected",
  VirtualSpreadsheet_RowHeader: "VirtualSpreadsheet_RowHeader",
  VirtualSpreadsheet_Row: "VirtualSpreadsheet_Row",
  VirtualSpreadsheet_Row__Selected: "VirtualSpreadsheet_Row__Selected",
  VirtualSpreadsheet_Row__CellSelected: "VirtualSpreadsheet_Row__CellSelected",
  VirtualSpreadsheet_Cell__UpdatePending: "VirtualSpreadsheet_Cell__UpdatePending",
  VirtualSpreadsheet_Cell: "VirtualSpreadsheet_Cell",
  VirtualSpreadsheet_Cell__Type_string: "VirtualSpreadsheet_Cell__Type_string",
  VirtualSpreadsheet_Cell__Type_number: "VirtualSpreadsheet_Cell__Type_number",
  VirtualSpreadsheet_Cell__Type_boolean: "VirtualSpreadsheet_Cell__Type_boolean",
  VirtualSpreadsheet_Cell__Type_null: "VirtualSpreadsheet_Cell__Type_null",
  VirtualSpreadsheet_Cell__Type_undefined: "VirtualSpreadsheet_Cell__Type_undefined",
  VirtualSpreadsheet_Cell__Type_CellError: "VirtualSpreadsheet_Cell__Type_CellError",
  VirtualSpreadsheet_Cell__Focus: "VirtualSpreadsheet_Cell__Focus",
  VirtualSpreadsheet_Cell__RowSelected: "VirtualSpreadsheet_Cell__RowSelected",
  VirtualSpreadsheet_Cell__ColumnSelected: "VirtualSpreadsheet_Cell__ColumnSelected",
  VirtualSpreadsheet_Cell__DataError: "VirtualSpreadsheet_Cell__DataError",
  VirtualSpreadsheet_ErrorTag: "VirtualSpreadsheet_ErrorTag"
}
