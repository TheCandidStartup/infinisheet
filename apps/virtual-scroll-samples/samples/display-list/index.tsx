import React from 'react';
import { createRoot } from 'react-dom/client';
import { DisplayList, useVariableSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
  <div className={ index == 0 ? "header" : "cell" } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function App() {
  const [offset, setOffset] = React.useState<number>(0);
  const [isVertical, setVertical] = React.useState<boolean>(false);
  const mapping = isVertical ? useVariableSizeItemOffsetMapping(30, [50]) : useVariableSizeItemOffsetMapping(100, [150]);

  return (
    <div className="app-container">
      <label>
        Offset: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            setOffset(value);
          }}
        />
      </label>

      <label>
        Layout: 
        <select
          value={isVertical ? 'vertical' : 'horizontal'}
          onChange={(event) => {
            const value = event.target?.value;
            setVertical(value == 'vertical');
          }}
        >
          <option value='horizontal'>Horizontal</option>
          <option value='vertical'>Vertical</option>
        </select>
      </label>

      <DisplayList
        offset={offset}
        layout={isVertical ? 'vertical' : 'horizontal'}
        className={'outerContainer'}
        height={isVertical ? 240 : 50}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Row}
      </DisplayList>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)