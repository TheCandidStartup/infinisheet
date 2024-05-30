import React from 'react';
import ReactDOM from 'react-dom';
import { VirtualList, VirtualListProxy, useFixedSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const Row = ({ index, style } : {index: number, style: any}) => (
  <div className={ index == 0 ? "header" : "cell" } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function App() {
  var mapping = useFixedSizeItemOffsetMapping(30);
  const list = React.createRef<VirtualListProxy>();

  return (
    <div>
      <label>
        Item: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target.value);
            list.current?.scrollToItem(value)
          }}
        />
      </label>

      <VirtualList
        ref={list}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        maxCssSize={1500}
        minNumPages={10}
        width={600}>
        {Row}
      </VirtualList>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
