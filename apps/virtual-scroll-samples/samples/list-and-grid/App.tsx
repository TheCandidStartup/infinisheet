import React from "react";
import { VirtualGrid, VirtualList, VirtualListProxy, VirtualGridProxy,
  useVariableSizeItemOffsetMapping, useFixedSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

const Row = ({ index, isScrolling, style }: { index: number, isScrolling?: boolean, style: React.CSSProperties }) => (
  <div className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

const Cell = ({ rowIndex, columnIndex, isScrolling, style }: { rowIndex: number, columnIndex: number, isScrolling?: boolean, style: React.CSSProperties }) => (
  <div className={ rowIndex == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
    { (rowIndex == 0) ? `${columnIndex}` : `${rowIndex}:${columnIndex}` }
  </div>
);

function App() {
  var mapping = useVariableSizeItemOffsetMapping(30, [50]);
  var columnMapping = useFixedSizeItemOffsetMapping(100);
  const listProxy = React.useRef<VirtualListProxy>(null);
  const gridProxy = React.useRef<VirtualGridProxy>(null);

  return (
    <div className="app-container">
      <label>
        ScrollToItem: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            listProxy.current?.scrollToItem(value);
            gridProxy.current?.scrollToItem(value, 0);
          }}
        />
      </label>

      <VirtualList
        className={"outerContainer"}
        ref={listProxy}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        useIsScrolling={true}
        width={600}>
        {Row}
      </VirtualList>

      <VirtualGrid
        className={"outerContainer"}
        ref={gridProxy}
        height={240}
        rowCount={100}
        rowOffsetMapping={mapping}
        columnCount={100}
        columnOffsetMapping={columnMapping}
        useIsScrolling={true}
        width={600}>
        {Cell}
      </VirtualGrid>
    </div>
  )
}

export default App
