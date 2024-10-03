import React from 'react';
import { VirtualList, VirtualListProxy, VirtualGrid, VirtualGridProxy,
  useFixedSizeItemOffsetMapping, VirtualOuterProps } from '@candidstartup/react-virtual-scroll';
import type { VirtualSpreadsheetTheme } from './VirtualSpreadsheetTheme';
import { indexToColRef, RowColCoords, rowColRefToCoords } from './RowColRef'
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

const Outer = React.forwardRef<HTMLDivElement, VirtualOuterProps >(({style, ...rest}, ref) => (
  <div ref={ref} style={{ ...style, overflow: "hidden"}} {...rest}/>
))
Outer.displayName = "HideScrollBar";

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

function ifdef(b: boolean, s: string|undefined) { return (b) ? s : undefined }

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
  const { theme, data, minRowCount=100, minColumnCount=26, maxRowCount=1000000000000, maxColumnCount=1000000000000 } = props;
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  const rowMapping = useFixedSizeItemOffsetMapping(30);
  const columnRef = React.useRef<VirtualListProxy>(null);
  const rowRef = React.useRef<VirtualListProxy>(null);
  const gridRef = React.useRef<VirtualGridProxy>(null);
  const pendingScrollToSelectionRef = React.useRef<boolean>(false);
  const focusCellRef = React.useRef<HTMLDivElement>(null);

  // Originally passed data.subscribe.bind(data) to useCallback. It works but React hooks lint fails because it can only validate
  // dependencies for an inline function.
  const subscribeFn = React.useCallback((cb: () => void) => data.subscribe(cb), [data]); 
  const snapshot = React.useSyncExternalStore<Snapshot>(subscribeFn, data.getSnapshot.bind(data), data.getServerSnapshot?.bind(data));

  const [name, setName] = React.useState("");
  const [hwmRowIndex, setHwmRowIndex] = React.useState(0);
  const [hwmColumnIndex, setHwmColumnIndex] = React.useState(0);
  const [selection, setSelection] = React.useState<RowColCoords>([undefined,undefined]);
  const [focusCell, setFocusCell] = React.useState<[number,number]|null>(null);

  const dataRowCount = data.getRowCount(snapshot);
  const rowCount = Math.max(minRowCount, dataRowCount, hwmRowIndex+1);
  const rowOffset = rowMapping.itemOffset(rowCount);
  const dataColumnCount = data.getColumnCount(snapshot);
  const columnCount = Math.max(minColumnCount, dataColumnCount, hwmColumnIndex+1);
  const columnOffset = columnMapping.itemOffset(columnCount);

  React.useLayoutEffect(() => {
    if (pendingScrollToSelectionRef.current) {
      pendingScrollToSelectionRef.current = false;

      gridRef.current?.scrollToItem(selection[0], selection[1]);
    }
  }, [selection])

  React.useEffect(() => {
    focusCellRef.current?.focus()
  }, [focusCell])

  function onScroll(rowOffsetValue: number, columnOffsetValue: number) {
    columnRef.current?.scrollTo(columnOffsetValue);
    rowRef.current?.scrollTo(rowOffsetValue);

    if (rowOffsetValue == 0)
      setHwmRowIndex(0);
    else if (gridRef.current && (rowOffsetValue + gridRef.current.clientHeight == rowOffset)) {
      // Infinite scrolling if we've reached the end
      if (hwmRowIndex < rowCount && rowCount < maxRowCount)
        setHwmRowIndex(rowCount);
    }

    if (columnOffsetValue == 0)
      setHwmColumnIndex(0);
    else if (gridRef.current && (columnOffsetValue + gridRef.current.clientWidth == columnOffset)) {
      // Infinite scrolling if we've reached the end
      if (hwmColumnIndex < columnCount && columnCount < maxColumnCount)
        setHwmColumnIndex(columnCount);
    }
  }

  function onNameKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter")
      return;

    let sizeChanged = false;
    let [row, col] = rowColRefToCoords(name);
    if (row !== undefined) {
      if (row >= maxRowCount)
        row = maxRowCount - 1;
      if (row > hwmRowIndex) {
        setHwmRowIndex(row);
        sizeChanged = true;
      } else if (row == 0)
        setHwmRowIndex(0);
    }
    if (col !== undefined) {
      if (col >= maxColumnCount)
        col = maxColumnCount - 1;
      if (col > hwmColumnIndex) {
        setHwmColumnIndex(col);
        sizeChanged = true;
      } else if (col == 0)
        setHwmColumnIndex(0);
    }

    setSelection([row,col]);
    if (row === undefined && col === undefined)
      setFocusCell(null);
    else
      setFocusCell([row ? row : 0, col ? col : 0])
    if (sizeChanged)
    {
      // Need to defer scroll to selection until after larger grid has been rendered
      pendingScrollToSelectionRef.current = true;
    } else 
      gridRef.current?.scrollToItem(row, col);
  }

  // Row and column header are oversized by one. Without this the headers don't align with the
  // grid when you scroll to the end. The grid and headers have different content
  // extents because of the grid scroll bars. The headers need something that can be
  // scrolled into view at the end of the scroll bars.
  const colRender: HeaderItemRender = (index, style ) => (
    <div className={join(theme?.VirtualSpreadsheet_Column, 
                    ifdef(undefined == selection[0] && index == selection[1], theme?.VirtualSpreadsheet_Column__Selected))} 
         style={style}>
      { (index < columnCount) ? indexToColRef(index) : "" }
    </div>
  );
  
  const rowRender: HeaderItemRender = (index, style) => (
    <div className={join(theme?.VirtualSpreadsheet_Row, 
                    ifdef(index == selection[0] && undefined == selection[1], theme?.VirtualSpreadsheet_Row__Selected))}
         style={style}>
      { (index < rowCount) ? index+1 : "" }
    </div>
  );
  
  const cellRender: CellRender = (rowIndex, columnIndex, style) => {
    const value = (rowIndex < dataRowCount && columnIndex < dataColumnCount) ? formatContent(data, snapshot, rowIndex, columnIndex) : "";
    const classNames = join(theme?.VirtualSpreadsheet_Cell,
      ifdef(rowIndex == selection[0] && undefined == selection[1], theme?.VirtualSpreadsheet_Cell__RowSelected),
      ifdef(undefined == selection[0] && columnIndex == selection[1], theme?.VirtualSpreadsheet_Cell__ColumnSelected));

    if (focusCell && rowIndex == focusCell[0] && columnIndex == focusCell[1]) {
      return <div
        ref={focusCellRef}
        className={join(classNames, theme?.VirtualSpreadsheet_Cell__Focus)}
        tabIndex={0}
        style={style}>
        { value }
      </div>
    } else {
      return <div className={classNames} style={style}>
        { value }
      </div>
    }
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

      <VirtualList
        ref={columnRef}
        className={theme?.VirtualSpreadsheet_ColumnHeader}
        itemData={colRender}
        outerComponent={Outer}
        height={50}
        itemCount={columnCount+1}
        itemOffsetMapping={columnMapping}
        layout={'horizontal'}
        maxCssSize={props.maxCssSize}
        minNumPages={props.minNumPages}
        width={props.width}>
        {HeaderItem}
      </VirtualList>

      <VirtualList
        ref={rowRef}
        className={theme?.VirtualSpreadsheet_RowHeader}
        itemData={rowRender}
        outerComponent={Outer}
        height={props.height}
        itemCount={rowCount+1}
        itemOffsetMapping={rowMapping}
        maxCssSize={props.maxCssSize}
        minNumPages={props.minNumPages}
        width={100}>
        {HeaderItem}
      </VirtualList>

      <VirtualGrid
        className={theme?.VirtualSpreadsheet_Grid}
        ref={gridRef}
        itemData={cellRender}
        onScroll={onScroll}
        height={props.height}
        rowCount={rowCount}
        rowOffsetMapping={rowMapping}
        columnCount={columnCount}
        columnOffsetMapping={columnMapping}
        maxCssSize={props.maxCssSize}
        minNumPages={props.minNumPages}
        width={props.width}>
        {Cell}
      </VirtualGrid>
    </div>
  )
}
