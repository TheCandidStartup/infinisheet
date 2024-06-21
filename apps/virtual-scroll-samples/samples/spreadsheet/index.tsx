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

const Outer = React.forwardRef<HTMLDivElement, VirtualOuterProps >(({className, style, onScroll, children}, ref) => (
  <div className={className} ref={ref} style={{ ...style, overflow: "hidden"}} onScroll={onScroll}>
    {children}
  </div>
))

function App() {
  var columnMapping = useFixedSizeItemOffsetMapping(100);
  var rowMapping = useFixedSizeItemOffsetMapping(30);
  const columnRef = React.createRef<VirtualListProxy>();
  const rowRef = React.createRef<VirtualListProxy>();
  const gridRef = React.createRef<VirtualGridProxy>();

  function onScroll(rowOffsetValue: number, columnOffsetValue: number) {
    columnRef.current?.scrollTo(columnOffsetValue);
    rowRef.current?.scrollTo(rowOffsetValue);
  }

  return (
    <div className="spreadsheet">
      <div className="spreadsheetScrollTo">
      <label>
        ScrollToItem: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            gridRef.current?.scrollToItem(value, value);
          }}
        />
      </label>
      </div>

      <div>CS</div>

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