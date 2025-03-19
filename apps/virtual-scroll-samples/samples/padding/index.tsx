import React from 'react';
import { createRoot } from 'react-dom/client';
import { VirtualScroll, VirtualScrollProxy, DisplayList, DisplayListItemProps, 
  AutoSizer, useFixedSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const PADDING_SIZE = 10;

const Row = ({ index, isScrolling, style }: DisplayListItemProps) => (
  <div 
    className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function App() {
  const mapping = useFixedSizeItemOffsetMapping(30);
  const ref = React.useRef<VirtualScrollProxy>(null);
  const itemCount = 100;
  const totalSize = mapping.itemOffset(itemCount);

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

      <VirtualScroll
      ref={ref}
      className={'outerContainer'}
      height={240}
      width={600}
      scrollHeight={totalSize + PADDING_SIZE*2}>
      {({ verticalOffset }) => (
        <AutoSizer style={{ height: '100%', width: '100%' }}>
        {({height,width}) => (
          <DisplayList
            offset={verticalOffset - PADDING_SIZE}
            height={height}
            itemCount={itemCount}
            itemOffsetMapping={mapping}
            width={width}>
            {Row}
          </DisplayList>
        )}
        </AutoSizer>
      )}
      </VirtualScroll>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />);