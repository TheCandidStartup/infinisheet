import React from 'react';
import { DisplayList, DisplayGrid, AutoSizer, VirtualContainerRender, VirtualScroll, VirtualScrollProxy,
  getRangeToScroll, getOffsetToScrollRange } from '@candidstartup/react-virtual-scroll';
import type { VirtualSpreadsheetTheme } from './VirtualSpreadsheetTheme';
import { SpreadsheetData, CellValue, indexToColRef, RowColCoords, rowColRefToCoords, rowColCoordsToRef } from '@candidstartup/infinisheet-types'
import * as numfmt from 'numfmt'

/** Extension of {@link SpreadsheetData} interface so that it's compatible with React's `useSyncExternalStore` hook
 * 
 * Additional properties are optional, so anything that implements `SpreadsheetData` is compatible with something
 * that accepts `ReactSpreadsheetData`.
 */
export interface ReactSpreadsheetData<Snapshot> extends SpreadsheetData<Snapshot> {
  /** Used by `useSyncExternalStore` to support server side rendering  */
  getServerSnapshot?: () => Snapshot
}

/**
 * Props for {@link VirtualSpreadsheetGeneric}
 * 
 * @typeParam Snapshot - Type of snapshot for `SpreadsheetData`
 */
export interface VirtualSpreadsheetGenericProps<Snapshot> {
  /** The `className` applied to the spreadsheet as a whole */
  className?: string,

  /** Spreadsheet theme which defines the CSS classes to apply
   * 
   * Defined as a union so that it supports both hand written themes
   * defined as implementations of {@link VirtualSpreadsheetTheme} and themes
   * implicitly defined by importing a CSS module. 
   */
  theme?: VirtualSpreadsheetTheme | Record<string, string>,

  /** Component height */
  height: number,

   /** Component width */
  width: number,

  /** Height of input bar
   * @defaultValue 30
   */
  inputBarHeight?: number,

  /** Height of column header
   * @defaultValue 50
   */
  columnHeaderHeight?: number,

  /** Width of row header
   * @defaultValue 100
   */
  rowHeaderWidth?: number,

  /** Data to display and edit */
  data: ReactSpreadsheetData<Snapshot>,

  /** Disables edit mode if true
   * @defaultValue false
  */
  readOnly?: boolean, 

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

/**
 * Props for {@link VirtualSpreadsheet}
 */
export interface VirtualSpreadsheetProps extends VirtualSpreadsheetGenericProps<unknown> {
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

function inRect(x: number, y: number, rect: DOMRect) {
  return (x >= rect.left && x < rect.right && y >= rect.top && y < rect.bottom);
}

// Return mouse coordinates in space of current event target. Not directly available so we convert
// using client coordinates.
function getCurrentTargetXY(event: React.MouseEvent<HTMLDivElement>): [number,number] {
  let clientX = event.clientX;
  let clientY = event.clientY;
  if (event.target !== event.currentTarget) {
    const target = event.target as Element;
    const targetRect = target.getBoundingClientRect();
    if (!inRect(clientX, clientY, targetRect))
    {
      // Sometimes get events with bogus client XY, often generated by some form of automation
      // If this happens behave as if middle of target rect was clicked
      clientX = (targetRect.left + targetRect.right) / 2;
      clientY = (targetRect.top + targetRect.bottom) / 2;
    }
  }

  const currentRect = event.currentTarget.getBoundingClientRect();
  if (!inRect(clientX, clientY, currentRect)) {
    // Somethings gone horribly wrong
    return [0,0];
  }

  return [clientX - currentRect.left, clientY - currentRect.top];
}

type HeaderItemRender = (index: number, style: React.CSSProperties) => React.JSX.Element;
function HeaderItem({ index, data, style }: { index: number, data:unknown, style: React.CSSProperties }) {
  const itemRender = data as HeaderItemRender;
  return itemRender(index, style);
}

type CellRender = (rowIndex: number, columnIndex: number, style: React.CSSProperties) => React.JSX.Element;
function Cell({ rowIndex, columnIndex, data, style }: { rowIndex: number, columnIndex: number, data: unknown, style: React.CSSProperties }) {
  const cellRender = data as CellRender;
  return cellRender(rowIndex, columnIndex, style);
}

/**
 * Virtual Spreadsheet
 * 
 * Accepts props defined by {@link VirtualSpreadsheetProps}. 
 * You must pass an instance of {@link SpreadsheetData} using the `data` prop.
 * 
 * @remarks
 * 
 * For most cases use this rather than {@link VirtualSpreadsheetGeneric}.
 * 
 * Accepts all parameterizations of `SpreadsheetData`. Implemented as `VirtualSpreadsheetGeneric<unknown>`.
 * 
 * @group Components
 */
export function VirtualSpreadsheet(props: VirtualSpreadsheetProps) {
  return VirtualSpreadsheetGeneric(props);
}

/**
 * Generic version of Virtual Spreadsheet
 * 
 * Accepts props defined by {@link VirtualSpreadsheetGenericProps}. 
 * You must pass an instance of {@link SpreadsheetData} with a compatible `Snapshot` parameter using the `data` prop.
 * 
 * @remarks
 * 
 * In almost all cases use {@link VirtualSpreadsheet} instead. Only use this if you need to restrict the types of `SpreadsheetData`
 * that can be used based on `Snapshot` type.
 * 
 * @typeParam Snapshot - Type of snapshot for `SpreadsheetData`
 * 
 * @group Components
 */
export function VirtualSpreadsheetGeneric<Snapshot>(props: VirtualSpreadsheetGenericProps<Snapshot>) {
  const { width, height, inputBarHeight=30, columnHeaderHeight=50, rowHeaderWidth=100,
    theme, data, readOnly=false, minRowCount=100, minColumnCount=26, maxRowCount=1000000000000, maxColumnCount=1000000000000 } = props;
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
            if (readOnly)
              nextCell(row,col,true,event.shiftKey);
            else
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
      const [x,_] = getCurrentTargetXY(event);
      const colOffset = x + gridColumnOffset;
      const [colIndex] = columnMapping.offsetToItem(colOffset);
      updateSelection(undefined,colIndex);
    }} 
    {...rest}/>
  )

  const rowHeaderRender: VirtualContainerRender = ({...rest}, ref) => (
    <div ref={ref}
    onClick={(event) => {
      const [_,y] = getCurrentTargetXY(event);
      const rowOffset = y + gridRowOffset;
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
        name={"edit"}
        title={"Edit"}
        readOnly={readOnly}
        value={cellValue}
        onChange={(event) => {
          setCellValue(event.target?.value);
          setEditMode(!readOnly);
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
        const [x,y] = getCurrentTargetXY(event);
        const colOffset = x + gridColumnOffset;
        const rowOffset = y + gridRowOffset;
        const [rowIndex] = rowMapping.offsetToItem(rowOffset);
        const [colIndex] = columnMapping.offsetToItem(colOffset);
        updateSelection(rowIndex,colIndex);
      }} 
      onDoubleClick={(_event) => {
        setCellValue(formula);
        setEditMode(!readOnly);
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

  const columnTemplate = `${rowHeaderWidth}px 1fr`;
  const rowTemplate = `${inputBarHeight}px ${columnHeaderHeight}px 1fr`;
  const minWidth = rowHeaderWidth * 2;
  const minHeight = inputBarHeight + columnHeaderHeight * 2;
  const gridWidth = Math.max(width - rowHeaderWidth, rowHeaderWidth);
  const gridHeight = Math.max(height - columnHeaderHeight - inputBarHeight, columnHeaderHeight);

  return (
    <div className={join(props.className, theme?.VirtualSpreadsheet)} 
        style={{ width, height, minWidth, minHeight, display: "grid", gridTemplateColumns: columnTemplate, gridTemplateRows: rowTemplate }}>
      <div className={theme?.VirtualSpreadsheet_InputBar} style={{overflow: 'hidden', display: 'flex', gridColumnStart: 1, gridColumnEnd: 3}}>
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
          readOnly={readOnly}
          name={"formula"}
          title={"Formula"}
          value={formula}
          onChange={(event) => {
            setFormula(event.target?.value);
            setEditMode(!readOnly);
            if (focusCell)
              setCellValue(event.target?.value);
          }}
          onFocus={() => {
              if (focusCell) {
                setCellValue(formula);
                setEditMode(!readOnly);
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
        height={columnHeaderHeight}
        itemCount={columnCount}
        itemOffsetMapping={columnMapping}
        layout={'horizontal'}
        width={gridWidth}>
        {HeaderItem}
      </DisplayList>

      <DisplayList
        offset={gridRowOffset}
        className={theme?.VirtualSpreadsheet_RowHeader}
        itemData={rowRender}
        outerRender={rowHeaderRender}
        height={gridHeight}
        itemCount={rowCount}
        itemOffsetMapping={rowMapping}
        width={rowHeaderWidth}>
        {HeaderItem}
      </DisplayList>

      <VirtualScroll
        className={theme?.VirtualSpreadsheet_Grid}
        ref={scrollRef}
        onScroll={onScroll}
        height={gridHeight}
        width={gridWidth}
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
