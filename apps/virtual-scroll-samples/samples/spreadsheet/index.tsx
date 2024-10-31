import React from 'react';
import { createRoot } from 'react-dom/client';
import { DisplayList, VirtualGrid, VirtualGridProxy, useFixedSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

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

function App() {
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  const rowMapping = useFixedSizeItemOffsetMapping(30);
  const gridRef = React.useRef<VirtualGridProxy>(null);
  const [offset, setOffset] = React.useState<[number,number]>([0,0]);

  function onScroll(rowOffsetValue: number, columnOffsetValue: number) {
    setOffset([rowOffsetValue, columnOffsetValue]);
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

      <DisplayList
        offset={offset[1]}
        className={'spreadsheetColumnHeader'}
        height={50}
        itemCount={100}
        itemOffsetMapping={columnMapping}
        layout={'horizontal'}
        width={600}>
        {Col}
      </DisplayList>

      <DisplayList
        offset={offset[0]}
        className={'spreadsheetRowHeader'}
        height={240}
        itemCount={100}
        itemOffsetMapping={rowMapping}
        width={100}>
        {Row}
      </DisplayList>

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

createRoot(document.getElementById('root')!).render(<App />);