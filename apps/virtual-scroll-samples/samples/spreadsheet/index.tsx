import React from 'react';
import ReactDOM from 'react-dom';
import { VirtualList, VirtualListProxy, VirtualGrid, VirtualGridProxy,
  useFixedSizeItemOffsetMapping, VirtualOuterProps } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

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

function App() {
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
    <div className="spreadsheet">
      <div className="spreadsheetScrollTo">
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
        className={'spreadsheetColumnHeader'}
        outerComponent={Outer}
        height={50}
        itemCount={100}
        itemOffsetMapping={columnMapping}
        layout={'horizontal'}
        width={600}>
        {Col}
      </VirtualList>

      <VirtualList
        ref={rowRef}
        className={'spreadsheetRowHeader'}
        outerComponent={Outer}
        height={240}
        itemCount={100}
        itemOffsetMapping={rowMapping}
        width={100}>
        {Row}
      </VirtualList>

      <VirtualGrid
        className={"spreadsheetGrid"}
        ref={gridRef}
        onScroll={onScroll}
        height={240}
        rowCount={100}
        rowOffsetMapping={rowMapping}
        columnCount={100}
        columnOffsetMapping={columnMapping}
        width={600}>
        {Cell}
      </VirtualGrid>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));