import React from 'react';
import { DisplayList, DisplayGrid, AutoSizer, VirtualContainerRender, VirtualScroll, VirtualScrollProxy,
  useVariableSizeItemOffsetMapping, getRangeToScroll, getOffsetToScrollRange } from '@candidstartup/react-virtual-scroll';
import type { VirtualSpreadsheetTheme } from './VirtualSpreadsheetTheme';
import { indexToColRef, RowColCoords, rowColRefToCoords, rowColCoordsToRef } from './RowColRef'
import type { SpreadsheetData } from './SpreadsheetData'
import { format as numfmtFormat } from 'numfmt'

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

function formatContent<Snapshot>(data: SpreadsheetData<Snapshot>, snapshot: Snapshot, rowIndex: number, columnIndex: number): string {
  const value = data.getCellValue(snapshot, rowIndex, columnIndex);
  if (value === null ||  value === undefined)
    return "";

  if (typeof value === 'object')
      return value.value;

  if (typeof value === 'string' && value[0] == '\'') {
    // Leading apostrophe means display rest of string as is
    return value.substring(1);
  }

  let format = data.getCellFormat(snapshot, rowIndex, columnIndex);
  if (format === undefined)
    format = "";

  return numfmtFormat(format, value, numfmtOptions);
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
  const columnMapping = useVariableSizeItemOffsetMapping(100, [160]);
  const rowMapping = useVariableSizeItemOffsetMapping(30, [70]);
  const scrollRef = React.useRef<VirtualScrollProxy>(null);
  const focusSinkRef = React.useRef<HTMLInputElement>(null);

  // Originally passed data.subscribe.bind(data) to useCallback. It works but React hooks lint fails because it can only validate
  // dependencies for an inline function.
  const subscribeFn = React.useCallback((cb: () => void) => data.subscribe(cb), [data]); 
  const snapshot = React.useSyncExternalStore<Snapshot>(subscribeFn, data.getSnapshot.bind(data), data.getServerSnapshot?.bind(data));

  const [name, setName] = React.useState("");
  const [hwmRowIndex, setHwmRowIndex] = React.useState(0);
  const [hwmColumnIndex, setHwmColumnIndex] = React.useState(0);
  const [selection, setSelection] = React.useState<RowColCoords>([undefined,undefined]);
  const [focusCell, setFocusCell] = React.useState<[number,number]|null>(null);
  const [[gridRowOffset, gridColumnOffset], setGridScrollState] = React.useState<[number,number]>([0, 0]);

  const dataRowCount = data.getRowCount(snapshot);
  const rowCount = Math.max(minRowCount, dataRowCount, hwmRowIndex+1, focusCell ? focusCell[0]+1 : 0);
  const rowOffset = rowMapping.itemOffset(rowCount);
  const dataColumnCount = data.getColumnCount(snapshot);
  const columnCount = Math.max(minColumnCount, dataColumnCount, hwmColumnIndex+1, focusCell ? focusCell[1]+1 : 0);
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

  function updateFocus(row: number|undefined, col: number|undefined) {
    if (row === undefined && col === undefined)
      setFocusCell(null);
    else
      setFocusCell([row ? row : 0, col ? col : 0])
  }

  function updateSelection(row: number|undefined, col: number|undefined) {
    setSelection([row,col]);
    setName(rowColCoordsToRef(row,col));
    updateFocus(row, col);
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

  function focusTo(row: number, col: number) {
    if (row < 0 || row >= rowCount)
      return;

    if (col < 0 || col >= columnCount)
      return;

    // Reset infinite scrolling if we're back at the start
    if (row == 0)
      setHwmRowIndex(0);
    if (col == 0)
      setHwmColumnIndex(0);

    // Infinite scrolling if we've reached the end
    if (row == rowCount-1 && rowCount < maxRowCount)
      setHwmRowIndex(rowCount);
    if (col == columnCount-1 && columnCount < maxColumnCount)
      setHwmColumnIndex(columnCount);

    updateSelection(row,col);
    ensureVisible(row,col);
  }

  function onNameKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter")
      return;

    let [row, col] = rowColRefToCoords(name);
    if (row !== undefined) {
      if (row >= maxRowCount)
        row = maxRowCount - 1;
      if (row > hwmRowIndex) {
        setHwmRowIndex(row);
      } else if (row == 0)
        setHwmRowIndex(0);
    }
    if (col !== undefined) {
      if (col >= maxColumnCount)
        col = maxColumnCount - 1;
      if (col > hwmColumnIndex) {
        setHwmColumnIndex(col);
      } else if (col == 0)
        setHwmColumnIndex(0);
    }

    updateSelection(row,col);
    ensureVisible(row, col);
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
        onFocus={() => { ensureVisible(row,col) }}
        onBeforeInput={() => { ensureVisible(row,col) }}
        onKeyDown={(event) => {
          switch (event.key) {
            case "ArrowDown": focusTo(row+1,col); event.preventDefault(); break;
            case "ArrowUp": focusTo(row-1,col); event.preventDefault(); break;
            case "ArrowLeft": focusTo(row,col-1); event.preventDefault(); break;
            case "ArrowRight": focusTo(row,col+1); event.preventDefault(); break;
          }
        }}
        style={{ zIndex: -1, position: "absolute", top: focusTop, height: focusHeight, left: focusLeft, width: focusWidth }}
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
      {...rest}>
      {children}
      {focusSink}
    </div>
  }

  const cellRender: CellRender = (rowIndex, columnIndex, style) => {
    const value = (rowIndex < dataRowCount && columnIndex < dataColumnCount) ? formatContent(data, snapshot, rowIndex, columnIndex) : "";
    const focused = focusCell && rowIndex == focusCell[0] && columnIndex == focusCell[1];
    const classNames = join(theme?.VirtualSpreadsheet_Cell,
      ifdef(rowSelected(rowIndex), theme?.VirtualSpreadsheet_Cell__RowSelected),
      ifdef(colSelected(columnIndex), theme?.VirtualSpreadsheet_Cell__ColumnSelected),
      ifdef(focused, theme?.VirtualSpreadsheet_Cell__Focus));

    return <div className={classNames} style={style}>
      { value }
    </div>
  };

  return (
    <div className={join(props.className, theme?.VirtualSpreadsheet)} style={{display: "grid", gridTemplateColumns: "100px 1fr", gridTemplateRows: "50px 50px 1fr"}}>
      <div className={theme?.VirtualSpreadsheet_Name} style={{gridColumnStart: 1, gridColumnEnd: 3}}>
      <label>
        Scroll To Row, Column or Cell: 
        <input
          type={"text"}
          value={name}
          height={200}
          onChange={(event) => {
            setName(event.target?.value);
          }}
          onKeyUp={onNameKeyUp}
        />
      </label>
      </div>

      <div></div>

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
