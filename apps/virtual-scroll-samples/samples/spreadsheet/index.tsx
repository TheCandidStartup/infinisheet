import React from 'react';
import ReactDOM from 'react-dom';
import { VirtualList, VirtualListProxy, useFixedSizeItemOffsetMapping,
   VirtualOuterProps } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const Row = ({ index, isScrolling, style }: { index: number, isScrolling?: boolean, style: React.CSSProperties }) => (
  <div className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

const Outer = React.forwardRef<HTMLDivElement, VirtualOuterProps >(({className, style, onScroll, children}, ref) => (
  <div className={className} ref={ref} style={{ ...style, overflow: "hidden"}} onScroll={onScroll}>
    {children}
  </div>
))

function App() {
  var mapping = useFixedSizeItemOffsetMapping(100);
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
        className={'outerContainer'}
        outerComponent={Outer}
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