import React from 'react';
import { createRoot } from 'react-dom/client';
import { VirtualList, VirtualListProxy, useFixedSizeItemOffsetMapping, DisplayListItemProps } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const Row = ({ index, isScrolling, style }: DisplayListItemProps) => (
  <div className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function App() {
  const mapping = useFixedSizeItemOffsetMapping(100);
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

createRoot(document.getElementById('root')!).render(<App />);