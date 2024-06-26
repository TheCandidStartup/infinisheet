import React from 'react';
import ReactDOM from 'react-dom';
import { VirtualList, VirtualListProxy, useFixedSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const Row = ({ index, isScrolling, style }: { index: number, isScrolling?: boolean, style: React.CSSProperties }) => (
  <div className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function App() {
  var mapping = useFixedSizeItemOffsetMapping(100);
  const ref = React.useRef<VirtualListProxy>(null);

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
        className={'outerContainer'}
        height={50}
        itemCount={100}
        itemOffsetMapping={mapping}
        layout={'horizontal'}
        width={600}>
        {Row}
      </VirtualList>

    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));