import React from 'react';
import { createRoot } from 'react-dom/client';
import { VirtualList, VirtualListProxy, useFixedSizeItemOffsetMapping, VirtualContainerRender } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const PADDING_SIZE = 10;

const Row = ({ index, isScrolling, style }: { index: number, isScrolling?: boolean, style: React.CSSProperties }) => (
  <div 
    className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

const innerRender: VirtualContainerRender = (({style, children, ...rest}, ref) => (
  <div 
    ref={ref} 
    style={{
      ...style,
      height: style?.height as number + PADDING_SIZE * 2,
      gridTemplateRows: PADDING_SIZE + "px " + style?.gridTemplateRows + " " + PADDING_SIZE +"px"
    }} 
    {...rest}>
    <div style={{ boxSizing: 'border-box' }}/>
    {children}
    <div style={{ boxSizing: 'border-box' }}/>
  </div>
))

function App() {
  const mapping = useFixedSizeItemOffsetMapping(30);
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
            const offset = mapping.itemOffset(value) + PADDING_SIZE;
            ref.current?.scrollTo(offset)
          }}
        />
      </label>

      <VirtualList
        ref={ref}
        className={'outerContainer'}
        innerRender={innerRender}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Row}
      </VirtualList>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />);