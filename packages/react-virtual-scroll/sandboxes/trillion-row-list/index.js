import React from 'react';
import ReactDOM from 'react-dom';
import { VirtualList, useVariableSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

import './styles.css';

const Row = ({ index, style }) => (
  <div className={ index == 0 ? "header" : "cell" } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function App() {
  var mapping = useVariableSizeItemOffsetMapping(30, [50]);
  const list = React.useRef(null);

  return (
    <div>
      <label>
        Item: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target.value);
            list.current.scrollToItem(value)
          }}
        />
      </label>

      <VirtualList
        ref={list}
        height={240}
        itemCount={1000000000000}
        itemOffsetMapping={mapping}
        width={600}>
        {Row}
      </VirtualList>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
