import React from 'react';
import { VirtualList, VirtualListProxy, VirtualGrid, VirtualGridProxy,
  useFixedSizeItemOffsetMapping, VirtualOuterProps } from '@candidstartup/react-virtual-scroll';
import type { VirtualSpreadsheetTheme } from './VirtualSpreadsheetTheme';
import { indexToColRef, RowColCoords, rowColRefToCoords } from './RowColRef'
import type { SpreadsheetData } from './SpreadsheetData'

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

function join(a?: string, b?: string) {
  if (a && b)
    return a + ' ' + b;
  return a ? a : b;
}

export function VirtualSpreadsheet<Snapshot>(props: VirtualSpreadsheetProps<Snapshot>) {
  const { theme, data, minRowCount=100, minColumnCount=26, maxRowCount=1000000000000, maxColumnCount=1000000000000 } = props;
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  const rowMapping = useFixedSizeItemOffsetMapping(30);
  const columnRef = React.useRef<VirtualListProxy>(null);
  const rowRef = React.useRef<VirtualListProxy>(null);
  const gridRef = React.useRef<VirtualGridProxy>(null);
  const pendingScrollToSelectionRef = React.useRef<boolean>(false);
  const snapshot = React.useSyncExternalStore<Snapshot>(data.subscribe.bind(data), 
    data.getSnapshot.bind(data), data.getServerSnapshot?.bind(data));

  const [name, setName] = React.useState("");
  const [hwmRowIndex, setHwmRowIndex] = React.useState(0);
  const [hwmColumnIndex, setHwmColumnIndex] = React.useState(0);
  const [selection, setSelection] = React.useState<RowColCoords>([undefined,undefined]);

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
    if (sizeChanged)
    {
      // Need to defer scroll to selection until after larger grid has been rendered
      pendingScrollToSelectionRef.current = true;
    } else 
      gridRef.current?.scrollToItem(row, col);
  }

  const Col = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div className={theme?.VirtualSpreadsheet_Column} style={style}>
      { indexToColRef(index) }
    </div>
  );
  
  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div className={theme?.VirtualSpreadsheet_Row} style={style}>
      { index+1 }
    </div>
  );
  
  const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
    <div className={theme?.VirtualSpreadsheet_Cell} style={style}>
      { (rowIndex < dataRowCount && columnIndex < dataColumnCount) ? data.getCellValue(snapshot, rowIndex, columnIndex) : "" }
    </div>
  );

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
        outerComponent={Outer}
        height={50}
        itemCount={columnCount}
        itemOffsetMapping={columnMapping}
        layout={'horizontal'}
        maxCssSize={props.maxCssSize}
        minNumPages={props.minNumPages}
        width={props.width}>
        {Col}
      </VirtualList>

      <VirtualList
        ref={rowRef}
        className={theme?.VirtualSpreadsheet_RowHeader}
        outerComponent={Outer}
        height={props.height}
        itemCount={rowCount}
        itemOffsetMapping={rowMapping}
        maxCssSize={props.maxCssSize}
        minNumPages={props.minNumPages}
        width={100}>
        {Row}
      </VirtualList>

      <VirtualGrid
        className={theme?.VirtualSpreadsheet_Grid}
        ref={gridRef}
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
