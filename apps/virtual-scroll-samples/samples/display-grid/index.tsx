import React from 'react';
import { createRoot } from 'react-dom/client';
import { DisplayGrid, useVariableSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
  <div className={ rowIndex == 0 ? "header" : "cell" } style={style}>
    { (rowIndex == 0) ? `${columnIndex}` : `${rowIndex}:${columnIndex}` }
  </div>
);


function App() {
  const [rowOffset, setRowOffset] = React.useState<number>(0);
  const [colOffset, setColOffset] = React.useState<number>(0);

  const rowMapping = useVariableSizeItemOffsetMapping(30, [50]);
  const colMapping = useVariableSizeItemOffsetMapping(100, [150]);

  return (
    <div className="app-container">
      <label>
        Row Offset: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            setRowOffset(value);
          }}
        />
      </label>

      <label>
        Col Offset: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            setColOffset(value);
          }}
        />
      </label>

      <DisplayGrid
        rowOffset={rowOffset}
        columnOffset={colOffset}
        className={'outerContainer'}
        rowCount={100}
        rowOffsetMapping={rowMapping}
        columnCount={100}
        columnOffsetMapping={colMapping}
        height={240}
        width={600}>
        {Cell}
      </DisplayGrid>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)