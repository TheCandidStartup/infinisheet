import React from 'react';
import ReactDOM from 'react-dom';
import { VirtualList, VirtualListProxy, useFixedSizeItemOffsetMapping, VirtualInnerProps } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const PADDING_SIZE = 10;

const Row = ({ index, isScrolling, style }: { index: number, isScrolling?: boolean, style: React.CSSProperties }) => (
  <div 
    className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } 
    style={{
      ...style,
      top: style.top as number + PADDING_SIZE
    }}
  >
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

const Inner = React.forwardRef<HTMLDivElement, VirtualInnerProps >(({style, ...rest}, ref) => (
  <div 
    ref={ref} 
    style={{
      ...style,
      height: style.height as number + PADDING_SIZE * 2
    }} 
    {...rest}
  />
))

function App() {
  var mapping = useFixedSizeItemOffsetMapping(30);
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
            const offset = mapping.itemOffset(value) + PADDING_SIZE;
            ref.current?.scrollTo(offset)
          }}
        />
      </label>

      <VirtualList
        ref={ref}
        className={'outerContainer'}
        innerComponent={Inner}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Row}
      </VirtualList>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));