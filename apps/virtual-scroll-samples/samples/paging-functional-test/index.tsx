import React from 'react';
import ReactDOM from 'react-dom';
import { VirtualList, VirtualListProxy, useFixedSizeItemOffsetMapping, ScrollState } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

const Row = ({ index, style } : {index: number, style: React.CSSProperties }) => (
  <div className={ index == 0 ? "header" : "cell" } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

interface OutputFieldProps {
  label: string,
  type: 'text' | 'number'
}

const OutputField = React.forwardRef<HTMLInputElement, OutputFieldProps >((props, ref)=> {
  const { label, ...otherProps } = props;
  const prompt = label + ": ";
  return (
    <div>
    <label>
      {prompt}
      <input {...otherProps} ref={ref} readOnly={true} disabled={true} />
    </label>
    </div>
  );
});

function App() {
  var mapping = useFixedSizeItemOffsetMapping(30);
  const list = React.useRef<VirtualListProxy>(null);
  const offset = React.useRef<HTMLInputElement>(null);
  const item = React.useRef<HTMLInputElement>(null);
  const scrollOffset = React.useRef<HTMLInputElement>(null);
  const renderOffset = React.useRef<HTMLInputElement>(null);
  const page = React.useRef<HTMLInputElement>(null);
  const scrollDirection = React.useRef<HTMLInputElement>(null);

  function onScroll(offsetValue: number, newScrollState: ScrollState) {
    if (offset.current)
      offset.current.value = offsetValue.toString();
    if (item.current) {
      const [itemValue] = mapping.offsetToItem(offsetValue);
      item.current.value = itemValue.toString();
    }
    if (scrollOffset.current)
      scrollOffset.current.value = newScrollState.scrollOffset.toString();
    if (renderOffset.current)
      renderOffset.current.value = newScrollState.renderOffset.toString();
    if (page.current)
      page.current.value = newScrollState.page.toString();
    if (scrollDirection.current)
      scrollDirection.current.value = newScrollState.scrollDirection;
  }

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
        className={"outerContainer"}
        ref={list}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        maxCssSize={1500}
        minNumPages={5}
        onScroll={onScroll}
        width={600}>
        {Row}
      </VirtualList>

      <OutputField ref={offset} label={"offset"} type={"number"}></OutputField>
      <OutputField ref={item} label={"Item"} type={"number"}></OutputField>
      <OutputField ref={scrollOffset} label={"ScrollOffset"} type={"number"}></OutputField>
      <OutputField ref={renderOffset} label={"RenderOffset"} type={"number"}></OutputField>
      <OutputField ref={page} label={"Page"} type={"number"}></OutputField>
      <OutputField ref={scrollDirection} label={"ScrollDirection"} type={"text"}></OutputField>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));
