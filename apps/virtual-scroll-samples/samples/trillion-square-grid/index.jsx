import React from 'react';
import ReactDOM from 'react-dom';
import { VirtualGrid, useVariableSizeItemOffsetMapping, useFixedSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const Cell = ({ rowIndex, columnIndex, style }) => (
  <div className={ rowIndex == 0 ? "header" : "cell" } style={style}>
    { (rowIndex == 0) ? `${columnIndex}` : `${rowIndex}:${columnIndex}` }
  </div>
);

function App() {
  var mapping = useVariableSizeItemOffsetMapping(30, [50]);
  var columnMapping = useFixedSizeItemOffsetMapping(280);
  const grid = React.createRef();
  const rowInput = React.createRef();
  const columnInput = React.createRef();

  function onChange() {
    const row = rowInput.current?.valueAsNumber || 0;
    const column = columnInput.current?.valueAsNumber || 0;
    grid.current?.scrollToItem(row, column);
  }

  return (
    <div>
      <label>
        Row: 
        <input
          ref={rowInput}
          type={"number"}
          height={200}
          onChange={onChange}
        />
      </label>
      <label>
        Col: 
        <input
          ref={columnInput}
          type={"number"}
          height={200}
          onChange={onChange}
        />
      </label>

      <VirtualGrid
        ref={grid}
        className={'outerContainer'}
        height={240}
        rowCount={1000000000000}
        rowOffsetMapping={mapping}
        columnCount={1000000000000}
        columnOffsetMapping={columnMapping}
        width={600}>
        {Cell}
      </VirtualGrid>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
