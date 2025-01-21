import React from 'react';
import { DisplayList, DisplayGrid, AutoSizer, VirtualContainerRender, VirtualScroll, VirtualScrollProxy,
  getRangeToScroll, getOffsetToScrollRange } from '@candidstartup/react-virtual-scroll';
import type { VirtualSpreadsheetTheme } from './VirtualSpreadsheetTheme';
import { indexToColRef, RowColCoords, rowColRefToCoords, rowColCoordsToRef } from './RowColRef'
import type { SpreadsheetData, CellValue } from './SpreadsheetData'
import * as numfmt from 'numfmt'

export interface ReactSpreadsheetData<Snapshot> extends SpreadsheetData<Snapshot> {
  getServerSnapshot?: () => Snapshot
}

/**
 * Props for {@link VirtualSpreadsheet}
 */
export interface VirtualSpreadsheetProps<Snapshot> {
  /** The `className` applied to the spreadsheet as a whole */
  className?: string,

  theme?: VirtualSpreadsheetTheme | Record<string, string>,

  /** Component height */
  height: number,

   /** Component width */
  width: number,

  /** Data to display and edit */
  data: ReactSpreadsheetData<Snapshot>,

  /** Minimum number of rows in the spreadsheet 
   * @defaultValue 100
  */
  minRowCount?: number,

  /** Maximum number of rows in the spreadsheet 
   * @defaultValue 1000000000000
  */
  maxRowCount?: number,

  /** Minimum number of columns in the grid 
   * @defaultValue 26
  */
  minColumnCount?: number,

  /** Maximum umber of columns in the grid 
   * @defaultValue 1000000000000
  */
  maxColumnCount?: number,

  /** 
   * Maximum size for CSS element beyond which layout breaks. You should never normally need to change this. 
   * The default value is compatible with all major browsers.
   * 
   * @defaultValue 6000000
   * */
  maxCssSize?: number,

  /**
   * The minimum number of virtual pages to use when inner container would otherwise be more than {@link VirtualSpreadsheetProps.maxCssSize} big.
   * You should never normally need to change this.
   * 
   * @defaultValue 100
   */
  minNumPages?: number
}

function join(...v: (string|undefined)[]) {
  let s: string|undefined = undefined;
  v.forEach(a => {
    if (s && a)
      s = s + ' ' + a;
    else if (a)
      s = a;
  });
  return s;
}

function ifdef(b: boolean|null, s: string|undefined) { return (b) ? s : undefined }

// Options for numfmt that match Google Sheets and ECMA-376 behavior. This is compatible with supported dates in Excel apart from Jan/Feb 1900. 
// This is due to Excel's backwards compatibility support for the Lotus 1-2-3 leap year bug that incorrectly thinks 1900 is a leap year.
const numfmtOptions = {
  leap1900: false,
  dateSpanLarge: true
}

function formatContent(value: CellValue, format: string | undefined): string {
  if (value === null ||  value === undefined)
    return "";

  if (typeof value === 'object')
      return value.value;

  if (typeof value === 'string' && value[0] == '\'') {
    // Leading apostrophe means display rest of string as is
    return value.substring(1);
  }

  if (format === undefined)
    format = "";

  return numfmt.format(format, value, numfmtOptions);
}

function classForType(value: CellValue) {
  if (value === null)
    return 'VirtualSpreadsheet_Cell__Type_null';
  if (value === undefined)
    return 'VirtualSpreadsheet_Cell__Type_undefined';

  const type = typeof value;
  if (type === 'object')
    return 'VirtualSpreadsheet_Cell__Type_CellError';

  return 'VirtualSpreadsheet_Cell__Type_' + type;
}

type HeaderItemRender = (index: number, style: React.CSSProperties) => JSX.Element;
function HeaderItem({ index, data, style }: { index: number, data:unknown, style: React.CSSProperties }) {
  const itemRender = data as HeaderItemRender;
  return itemRender(index, style);
}

type CellRender = (rowIndex: number, columnIndex: number, style: React.CSSProperties) => JSX.Element;
function Cell({ rowIndex, columnIndex, data, style }: { rowIndex: number, columnIndex: number, data: unknown, style: React.CSSProperties }) {
  const cellRender = data as CellRender;
  return cellRender(rowIndex, columnIndex, style);
}

export function VirtualSpreadsheet<Snapshot>(props: VirtualSpreadsheetProps<Snapshot>) {
  const { width, height, theme, data, minRowCount=100, minColumnCount=26, maxRowCount=1000000000000, maxColumnCount=1000000000000 } = props;
  const scrollRef = React.useRef<VirtualScrollProxy>(null);
  const focusSinkRef = React.useRef<HTMLInputElement>(null);

  // Originally passed data.subscribe.bind(data) to useCallback. It works but React hooks lint fails because it can only validate
  // dependencies for an inline function.
  const subscribeFn = React.useCallback((cb: () => void) => data.subscribe(cb), [data]); 
  const snapshot = React.useSyncExternalStore<Snapshot>(subscribeFn, data.getSnapshot.bind(data), data.getServerSnapshot?.bind(data));

  const [name, setName] = React.useState("");
  const [formula, setFormula] = React.useState("");
  const [cellValue, setCellValue] = React.useState("");
  const [editMode, setEditMode] = React.useState(false);
  const [hwmRowIndex, setHwmRowIndex] = React.useState(0);
  const [hwmColumnIndex, setHwmColumnIndex] = React.useState(0);
  const [selection, setSelection] = React.useState<RowColCoords>([undefined,undefined]);
  const [focusCell, setFocusCell] = React.useState<[number,number]|null>(null);
  const [[gridRowOffset, gridColumnOffset], setGridScrollState] = React.useState<[number,number]>([0, 0]);

  const dataRowCount = data.getRowCount(snapshot);
  const rowCount = Math.max(minRowCount, dataRowCount, hwmRowIndex+1, focusCell ? focusCell[0]+1 : 0);
  const rowMapping = data.getRowItemOffsetMapping(snapshot);
  const rowOffset = rowMapping.itemOffset(rowCount);
  const dataColumnCount = data.getColumnCount(snapshot);
  const columnCount = Math.max(minColumnCount, dataColumnCount, hwmColumnIndex+1, focusCell ? focusCell[1]+1 : 0);
  const columnMapping = data.getColumnItemOffsetMapping(snapshot);
  const columnOffset = columnMapping.itemOffset(columnCount);

  React.useEffect(() => {
    scrollRef.current?.scrollTo(gridRowOffset, gridColumnOffset);
  }, [gridRowOffset, gridColumnOffset])

  React.useEffect(() => {
    focusSinkRef.current?.focus({preventScroll: true})
  }, [focusCell])

  function onScroll(rowOffsetValue: number, columnOffsetValue: number) {
    if (rowOffsetValue == gridRowOffset && columnOffsetValue == gridColumnOffset)
      return;

    if (rowOffsetValue == 0)
      setHwmRowIndex(0);
    else if (scrollRef.current && (rowOffsetValue + scrollRef.current.clientHeight == rowOffset)) {
      // Infinite scrolling if we've reached the end
      if (hwmRowIndex < rowCount && rowCount < maxRowCount)
        setHwmRowIndex(rowCount);
    }

    if (columnOffsetValue == 0)
      setHwmColumnIndex(0);
    else if (scrollRef.current && (columnOffsetValue + scrollRef.current.clientWidth == columnOffset)) {
      // Infinite scrolling if we've reached the end
      if (hwmColumnIndex < columnCount && columnCount < maxColumnCount)
        setHwmColumnIndex(columnCount);
    }

    setGridScrollState([rowOffsetValue, columnOffsetValue]);
  }

  function updateFormula(rowIndex: number, colIndex: number, editMode: boolean) {
    if (rowIndex < dataRowCount && colIndex < dataColumnCount) {
      const dataValue = data.getCellValue(snapshot, rowIndex, colIndex);
      const format = data.getCellFormat(snapshot, rowIndex, colIndex);
      const value = formatContent(dataValue, format);
      setFormula(value);
      setCellValue(editMode ? value : "");
    } else {
      setFormula("");
      setCellValue("");
    }
  }

  function updateFocus(rowIndex: number, colIndex: number) {
    if (!focusCell || rowIndex != focusCell[0] || colIndex != focusCell[1]) {
      // Reset formula and edit mode only if the focus cell is changing
      updateFormula(rowIndex, colIndex, false);
      setEditMode(false);
    }

    // We use change of focusCell state to trigger effect that gives focus to the focus sink
    // Make sure we always change state, even if focus cell hasn't changed. Any click in grid
    // removes focus from focus sink. Need to make sure it's always given back, even if user
    // clicked on focus cell again. 
    setFocusCell([rowIndex, colIndex]);
  }

  function updateSelection(row: number|undefined, col: number|undefined) {
    if (row === undefined && col === undefined) {
      // Clear out and bail if nothing selected
      setFocusCell(null);
      setFormula("");
      setCellValue("");
      setEditMode(false);
      return;
    }

    if (row !== selection[0] || col !== selection[1]) {
      setSelection([row,col]);
      setName(rowColCoordsToRef(row,col));
    }

    const rowIndex = row ? row : 0;
    const colIndex = col ? col : 0;
    updateFocus(rowIndex, colIndex);
  }

  function ensureVisible(row: number|undefined, col: number|undefined) {
    const scroll = scrollRef.current;
    if (!scroll)
      return;

    // Implements same logic as VirtualScrollProxy.scrollToArea so that we can directly update our grid scroll state.
    // React 18+ gives scroll events a lower priority than discrete events like key and mouse clicks. If we use
    // scrollToArea + OnScroll callback we can end up with other state changes being rendered immediately with the
    // scroll related changes being rendered a frame later. 
    // Scroll bar position is synchronized with state in an effect post render.
    const rowRange = getRangeToScroll(row, rowMapping);
    const colRange = getRangeToScroll(col, columnMapping);

    const newRowOffset = getOffsetToScrollRange(...rowRange, scroll.clientHeight, gridRowOffset, 'visible');
    const newColOffset = getOffsetToScrollRange(...colRange, scroll.clientWidth, gridColumnOffset, 'visible');
    if (newRowOffset !== undefined || newColOffset !== undefined) {
      setGridScrollState([(newRowOffset === undefined) ? gridRowOffset : newRowOffset, (newColOffset === undefined) ? gridColumnOffset : newColOffset]);
    }
  }

  // Is cell in selected row or column?
  function isInSelection(row: number|undefined, col: number|undefined): boolean {
    if (row === undefined || col === undefined)
      return false;

    return (selection[0] === undefined && col === selection[1]) ||
      (selection[1] === undefined && row === selection[0]);
  }

  // Expands grid as needed for target cell
  function selectItem(row: number|undefined, col: number|undefined, keepSelection?: boolean) {
    if (row !== undefined) {
      if (row < 0)
        return;
      if (row >= maxRowCount)
        row = maxRowCount - 1;
      if (row > hwmRowIndex) {
        setHwmRowIndex(row);
      } else if (row == 0)
        setHwmRowIndex(0);
    }

    if (col !== undefined) {
      if (col < 0)
        return;
      if (col >= maxColumnCount)
        col = maxColumnCount - 1;
      if (col > hwmColumnIndex) {
        setHwmColumnIndex(col);
      } else if (col == 0)
        setHwmColumnIndex(0);
    }

    // If desired and possible move focus within existing selection rather than changing selection
    if (keepSelection && isInSelection(row,col)) {
      const rowIndex = row ? row : 0;
      const colIndex = col ? col : 0;
      updateFocus(rowIndex, colIndex);
    } else {
      updateSelection(row,col);
    }
    ensureVisible(row,col);
  }

  // Move on to next cell. 
  // Moves within selected row or column. If none moves vertically if isVertical otherwise horizontally. 
  // Move backwards (left/dup) if isBackwards, otherwise forwards
  function nextCell(row: number, col: number, isVertical: boolean, isBackwards: boolean) {
    if (selection[0] === undefined && selection[1] === undefined)
      return;

    const offset = isBackwards ? -1 : 1;

    if (selection[0] === undefined) {
      // Column selected - move vertically within existing selection
      selectItem(row+offset, col, true);
    } else if (selection[1] === undefined) {
      // Row selected - move horizontally within existing selection
      selectItem(row, col+offset, true);
    } else {
      // Cell selected
      if (isVertical)
        selectItem(row+offset,col);
      else
        selectItem(row,col+offset);
    }
  }

  function onNameKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter")
      return;

    const [row, col] = rowColRefToCoords(name);
    selectItem(row,col);
  }

  function CommitFormulaChange(rowIndex: number, colIndex: number) {
    let value: CellValue = undefined;
    let format: string | undefined = undefined;
    const parseData =  numfmt.parseValue(formula);
    if (parseData) {
      // number or boolean
      value = parseData.v;
      format = parseData.z;
    } else {
      // string
      value = formula;
    }

    data.setCellValueAndFormat(rowIndex, colIndex, value, format);
  }

  // Used by both formula and focus sink input fields
  function onEditValueKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!focusCell)
      return;

    const row = focusCell[0];
    const col = focusCell[1];

    if (editMode) {
      switch (event.key) {
        case "Escape": { 
          updateFormula(row, col, false); 
          setEditMode(false); 
          setFocusCell([row, col]); 
        } 
        break;

        case "Enter": { 
          CommitFormulaChange(row, col); 
          updateFormula(row, col, false); 
          setEditMode(false);
          nextCell(row,col,true,event.shiftKey);
        } 
        break;

        case "Tab": { 
          CommitFormulaChange(row, col); 
          updateFormula(row, col, false); 
          setEditMode(false);
          nextCell(row,col,false,event.shiftKey);
          event.preventDefault();
        } 
        break;
      }
    } else {
      switch (event.key) {
        case "ArrowDown": { selectItem(row+1,col); event.preventDefault(); } break;
        case "ArrowUp": { selectItem(row-1,col); event.preventDefault(); } break;
        case "ArrowLeft": { selectItem(row,col-1); event.preventDefault(); } break;
        case "ArrowRight": { selectItem(row,col+1); event.preventDefault(); } break;
        case "Tab": { nextCell(row,col,false,event.shiftKey); event.preventDefault(); } break;
        case "Enter": { 
          if (isInSelection(row,col)) {
            nextCell(row,col,true,event.shiftKey);
          } else {
            updateFormula(row, col, true); 
            setEditMode(true);
          }
        } 
        break;
      }
    }
  }

  function colSelected(index: number) { return (selection[0] == undefined && selection[1] == index) }
  function colCellSelected(index: number) { 
    return (selection[0] != undefined) && (selection[1] == undefined || selection[1] == index)
  }
  function rowSelected(index: number) { return (selection[0] == index && selection[1] == undefined) }
  function rowCellSelected(index: number) { 
    return (selection[1] != undefined) && (selection[0] == undefined || selection[0] == index)
  }

  const colHeaderRender: VirtualContainerRender = ({...rest}, ref) => (
    <div ref={ref}
    onClick={(event) => {
      const headerRect = event.currentTarget.getBoundingClientRect();
      const colOffset = event.clientX - headerRect.left + gridColumnOffset;
      const [colIndex] = columnMapping.offsetToItem(colOffset);
      updateSelection(undefined,colIndex);
    }} 
    {...rest}/>
  )

  const rowHeaderRender: VirtualContainerRender = ({...rest}, ref) => (
    <div ref={ref}
    onClick={(event) => {
      const headerRect = event.currentTarget.getBoundingClientRect();
      const rowOffset = event.clientY - headerRect.top + gridRowOffset;
      const [rowIndex] = rowMapping.offsetToItem(rowOffset);
      updateSelection(rowIndex, undefined);
    }} 
    {...rest}/>
  )
  
  const colRender: HeaderItemRender = (index, style ) => (
    <div className={join(theme?.VirtualSpreadsheet_Column, 
                    ifdef(colSelected(index), theme?.VirtualSpreadsheet_Column__Selected),
                    ifdef(colCellSelected(index), theme?.VirtualSpreadsheet_Column__CellSelected))} 
         style={style}>
      { indexToColRef(index) }
    </div>
  );
  
  const rowRender: HeaderItemRender = (index, style) => (
    <div className={join(theme?.VirtualSpreadsheet_Row, 
                    ifdef(rowSelected(index), theme?.VirtualSpreadsheet_Row__Selected),
                    ifdef(rowCellSelected(index), theme?.VirtualSpreadsheet_Row__CellSelected))}
         style={style}>
      { index+1 }
    </div>
  );
  
  const outerGridRender: VirtualContainerRender = ({children, ...rest}, ref) => {
    let focusSink;
    if (focusCell) {
      const row = focusCell[0];
      const col = focusCell[1];

      // Position focus sink underneath focused cell. If outside viewport clamp position.
      // Careful - focus cell might be bigger than the viewport!
      const focusHeight = rowMapping.itemSize(row);
      let focusTop = rowMapping.itemOffset(row) - gridRowOffset;
      if (focusTop < -focusHeight)
        focusTop = -focusHeight;
      else if (focusTop > height)
        focusTop = height;

      const focusWidth = columnMapping.itemSize(col);
      let focusLeft = columnMapping.itemOffset(col) - gridColumnOffset;
      if (focusLeft < -focusWidth)
        focusLeft = -focusWidth;
      else if (focusLeft > width)
        focusLeft = width;

      // Browser will try and bring focus sink into view in various scenarios like text being typed or user
      // giving it focus by tabbing between fields. All browsers I tested make a horrible mess of things
      // due to the sticky positioning. Need to use my own ensureVisible method to clean up.
      focusSink = <input
        ref={focusSinkRef}
        className={join(theme?.VirtualSpreadsheet_Cell, theme?.VirtualSpreadsheet_Cell__Focus)}
        type={"text"}
        value={cellValue}
        onChange={(event) => {
          setCellValue(event.target?.value);
          setEditMode(true);
          setFormula(event.target?.value);
        }}
        onFocus={() => { ensureVisible(row,col) }}
        onBeforeInput={() => { ensureVisible(row,col) }}
        onKeyDown={onEditValueKeyDown}
        style={{ zIndex: editMode ? 1 : -1, position: "absolute", top: focusTop, height: focusHeight, left: focusLeft, width: focusWidth }}
      />
    }
    return <div ref={ref}
      onClick={(event) => {
        const gridRect = event.currentTarget.getBoundingClientRect();
        const colOffset = event.clientX - gridRect.left + gridColumnOffset;
        const rowOffset = event.clientY - gridRect.top + gridRowOffset;
        const [rowIndex] = rowMapping.offsetToItem(rowOffset);
        const [colIndex] = columnMapping.offsetToItem(colOffset);
        updateSelection(rowIndex,colIndex);
      }} 
      onDoubleClick={(_event) => {
        setCellValue(formula);
        setEditMode(true);
      }} 
      {...rest}>
      {children}
      {focusSink}
    </div>
  }

  const cellRender: CellRender = (rowIndex, columnIndex, style) => {
    let dataValue: CellValue = undefined;
    let value:string = "";
    if (rowIndex < dataRowCount && columnIndex < dataColumnCount) {
      dataValue = data.getCellValue(snapshot, rowIndex, columnIndex);
      const format = data.getCellFormat(snapshot, rowIndex, columnIndex);
      value = formatContent(dataValue, format);
    }

    const focused = focusCell && rowIndex == focusCell[0] && columnIndex == focusCell[1];
    const classNames = join(theme?.VirtualSpreadsheet_Cell,
      ifdef(rowSelected(rowIndex), theme?.VirtualSpreadsheet_Cell__RowSelected),
      ifdef(colSelected(columnIndex), theme?.VirtualSpreadsheet_Cell__ColumnSelected),
      classForType(dataValue),
      ifdef(focused, theme?.VirtualSpreadsheet_Cell__Focus));

    return <div className={classNames} style={style}>
      { value }
    </div>
  };

  return (
    <div className={join(props.className, theme?.VirtualSpreadsheet)} style={{display: "grid", gridTemplateColumns: "100px 1fr", gridTemplateRows: "30px 50px 1fr"}}>
      <div className={theme?.VirtualSpreadsheet_InputBar} style={{display: "flex", gridColumnStart: 1, gridColumnEnd: 3}}>
        <input className={theme?.VirtualSpreadsheet_Name}
          type={"text"}
          name={"name"}
          title={"Name"}
          value={name}
          size={20}
          onChange={(event) => {
            setName(event.target?.value);
          }}
          onKeyUp={onNameKeyUp}
        />
        <label className={theme?.VirtualSpreadsheet_Fx}>fx</label>
        <input className={theme?.VirtualSpreadsheet_Formula}
          style={{flexGrow: 1}}
          type={"text"}
          name={"formula"}
          title={"Formula"}
          value={formula}
          onChange={(event) => {
            setFormula(event.target?.value);
            setEditMode(true);
            if (focusCell)
              setCellValue(event.target?.value);
          }}
          onFocus={() => {
              if (focusCell) {
                setCellValue(formula);
                setEditMode(true);
              }
          }}
          onKeyDown={onEditValueKeyDown}
        />
      </div>

      <div className={theme?.VirtualSpreadsheet_CornerHeader}></div>

      <DisplayList
        offset={gridColumnOffset}
        className={theme?.VirtualSpreadsheet_ColumnHeader}
        itemData={colRender}
        outerRender={colHeaderRender}
        height={50}
        itemCount={columnCount}
        itemOffsetMapping={columnMapping}
        layout={'horizontal'}
        width={props.width}>
        {HeaderItem}
      </DisplayList>

      <DisplayList
        offset={gridRowOffset}
        className={theme?.VirtualSpreadsheet_RowHeader}
        itemData={rowRender}
        outerRender={rowHeaderRender}
        height={props.height}
        itemCount={rowCount}
        itemOffsetMapping={rowMapping}
        width={100}>
        {HeaderItem}
      </DisplayList>

      <VirtualScroll
        className={theme?.VirtualSpreadsheet_Grid}
        ref={scrollRef}
        onScroll={onScroll}
        height={props.height}
        width={props.width}
        scrollHeight={rowOffset}
        scrollWidth={columnOffset}
        useOffsets={false}
        maxCssSize={props.maxCssSize}
        minNumPages={props.minNumPages}>
        {(_) => (
          <AutoSizer style={{ height: '100%', width: '100%' }}>
          {({height,width}) => (
            <DisplayGrid
              rowOffset={gridRowOffset}
              columnOffset={gridColumnOffset}
              height={height}
              width={width}
              itemData={cellRender}
              outerRender={outerGridRender}
              rowCount={rowCount}
              rowOffsetMapping={rowMapping}
              columnCount={columnCount}
              columnOffsetMapping={columnMapping}>
              {Cell}
            </DisplayGrid>
          )}
          </AutoSizer>
        )}
      </VirtualScroll>
    </div>
  )
}
