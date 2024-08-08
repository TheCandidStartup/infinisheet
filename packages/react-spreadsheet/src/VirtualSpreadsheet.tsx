import React from 'react';
import { VirtualList, VirtualListProxy, VirtualGrid, VirtualGridProxy,
  useFixedSizeItemOffsetMapping, VirtualOuterProps } from '@candidstartup/react-virtual-scroll';

/**
 * Props for {@link VirtualSpreadsheet}
 */
export interface VirtualSpreadsheetProps {
  /** The `className` applied to the spreadsheet as a whole */
  className?: string,

  /** The `className` applied to the grid outer container */
  gridClassName?: string,

    /** The `className` applied to the column header outer container */
  columnHeaderClassName?: string,

  /** The `className` applied to the row header outer container */
  rowHeaderClassName?: string,

  /** Component height */
  height: number,

   /** Component width */
  width: number,

  /** Minimum number of rows in the spreadsheet */
  minRowCount: number,

  /** Minimum umber of columns in the grid */
  minColumnCount: number,

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

const Col = ({ index, style }: { index: number, style: React.CSSProperties }) => (
  <div className="spreadsheetColumn" style={style}>
    { index }
  </div>
);

const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
  <div className="spreadsheetRow" style={style}>
    { index }
  </div>
);

const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
  <div className="spreadsheetCell" style={style}>
    { `${rowIndex}:${columnIndex}` }
  </div>
);

const Outer = React.forwardRef<HTMLDivElement, VirtualOuterProps >(({style, ...rest}, ref) => (
  <div ref={ref} style={{ ...style, overflow: "hidden"}} {...rest}/>
))

export function VirtualSpreadsheet(props: VirtualSpreadsheetProps) {
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  const rowMapping = useFixedSizeItemOffsetMapping(30);
  const columnRef = React.useRef<VirtualListProxy>(null);
  const rowRef = React.useRef<VirtualListProxy>(null);
  const gridRef = React.useRef<VirtualGridProxy>(null);

  function onScroll(rowOffsetValue: number, columnOffsetValue: number) {
    columnRef.current?.scrollTo(columnOffsetValue);
    rowRef.current?.scrollTo(rowOffsetValue);
  }

  return (
    <div className={props.className} style={{display: "grid", gridTemplateColumns: "100px 1fr", gridTemplateRows: "50px 50px 1fr"}}>
      <div className="spreadsheetScrollTo" style={{gridColumnStart: 1, gridColumnEnd: 3}}>
      <label>
        Scroll To Row: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            gridRef.current?.scrollToItem(value, 0);
          }}
        />
      </label>
      </div>

      <div></div>

      <VirtualList
        ref={columnRef}
        className={props.columnHeaderClassName}
        outerComponent={Outer}
        height={50}
        itemCount={props.minColumnCount}
        itemOffsetMapping={columnMapping}
        layout={'horizontal'}
        width={props.width}>
        {Col}
      </VirtualList>

      <VirtualList
        ref={rowRef}
        className={props.rowHeaderClassName}
        outerComponent={Outer}
        height={props.height}
        itemCount={props.minRowCount}
        itemOffsetMapping={rowMapping}
        width={100}>
        {Row}
      </VirtualList>

      <VirtualGrid
        className={props.gridClassName}
        ref={gridRef}
        onScroll={onScroll}
        height={props.height}
        rowCount={props.minRowCount}
        rowOffsetMapping={rowMapping}
        columnCount={props.minColumnCount}
        columnOffsetMapping={columnMapping}
        width={props.width}>
        {Cell}
      </VirtualGrid>
    </div>
  )
}
