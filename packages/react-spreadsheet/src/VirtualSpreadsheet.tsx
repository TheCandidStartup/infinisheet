import React from 'react';
import { VirtualList, VirtualListProxy, VirtualGrid, VirtualGridProxy,
  useFixedSizeItemOffsetMapping, VirtualOuterProps } from '@candidstartup/react-virtual-scroll';
import type { VirtualSpreadsheetTheme } from './VirtualSpreadsheetTheme';

/**
 * Props for {@link VirtualSpreadsheet}
 */
export interface VirtualSpreadsheetProps {
  /** The `className` applied to the spreadsheet as a whole */
  className?: string,

  theme?: VirtualSpreadsheetTheme | Record<string, string>,

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

const Outer = React.forwardRef<HTMLDivElement, VirtualOuterProps >(({style, ...rest}, ref) => (
  <div ref={ref} style={{ ...style, overflow: "hidden"}} {...rest}/>
))
Outer.displayName = "HideScrollBar";

function join(a?: string, b?: string) {
  if (a && b)
    return a + ' ' + b;
  return a ? a : b;
}

export function VirtualSpreadsheet(props: VirtualSpreadsheetProps) {
  const { theme } = props;
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  const rowMapping = useFixedSizeItemOffsetMapping(30);
  const columnRef = React.useRef<VirtualListProxy>(null);
  const rowRef = React.useRef<VirtualListProxy>(null);
  const gridRef = React.useRef<VirtualGridProxy>(null);

  function onScroll(rowOffsetValue: number, columnOffsetValue: number) {
    columnRef.current?.scrollTo(columnOffsetValue);
    rowRef.current?.scrollTo(rowOffsetValue);
  }

  const Col = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div className={theme?.VirtualSpreadsheet_Column} style={style}>
      { index }
    </div>
  );
  
  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div className={theme?.VirtualSpreadsheet_Row} style={style}>
      { index }
    </div>
  );
  
  const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
    <div className={theme?.VirtualSpreadsheet_Cell} style={style}>
      { `${rowIndex}:${columnIndex}` }
    </div>
  );

  return (
    <div className={join(props.className, theme?.VirtualSpreadsheet)} style={{display: "grid", gridTemplateColumns: "100px 1fr", gridTemplateRows: "50px 50px 1fr"}}>
      <div className={theme?.VirtualSpreadsheet_Name} style={{gridColumnStart: 1, gridColumnEnd: 3}}>
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
        className={theme?.VirtualSpreadsheet_ColumnHeader}
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
        className={theme?.VirtualSpreadsheet_RowHeader}
        outerComponent={Outer}
        height={props.height}
        itemCount={props.minRowCount}
        itemOffsetMapping={rowMapping}
        width={100}>
        {Row}
      </VirtualList>

      <VirtualGrid
        className={theme?.VirtualSpreadsheet_Grid}
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
