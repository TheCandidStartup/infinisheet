import './App.css'
import React from "react";
import { VirtualList, VirtualListProxy } from './VirtualList';
import { useVariableSizeItemOffsetMapping } from './useVariableSizeItemOffsetMapping';

const Cell = ({ index, isScrolling, style }: { index: number, isScrolling?: boolean, style: any }) => (
  <div className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function App() {
  var mapping = useVariableSizeItemOffsetMapping(30, [50]);
  const ref = React.createRef<VirtualListProxy>();

  return (
    <div className="app-container">
      <label>
        ScrollToItem: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            ref.current?.scrollToItem(value)
          }}
        />
      </label>

      <VirtualList
        ref={ref}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        useIsScrolling={true}
        width={600}>
        {Cell}
      </VirtualList>
    </div>
  )
}

export default App
