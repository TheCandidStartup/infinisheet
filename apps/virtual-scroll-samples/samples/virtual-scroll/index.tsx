import React from 'react';
import { createRoot } from 'react-dom/client';
import { VirtualScroll, VirtualScrollProxy, ScrollState, VirtualContentRender, 
  DisplayList, useVariableSizeItemOffsetMapping, AutoSizer } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

interface AppState {
  verticalOffset: number,
  horizontalOffset: number, 
  verticalScrollState: ScrollState,
  horizontalScrollState: ScrollState
}

const mapping = useVariableSizeItemOffsetMapping(30, [50]);

const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
  <div className={ index == 0 ? "header" : "cell" } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function App() {
  const [appState, setAppState] = React.useState<AppState|null>(null);
  const ref = React.useRef<VirtualScrollProxy>(null);
  const [scrollHeight, setScrollHeight] = React.useState<number>(3200);
  const [scrollWidth, setScrollWidth] = React.useState<number>(0);

  const contentRender: VirtualContentRender = ({isScrolling, style, ...rest}, ref) => (
    <div ref={ref} style={{display: 'flex', flexDirection: 'column', ...style}} {...rest}>
      isScrolling: {isScrolling ? 'true' : 'false'} <br/>
      verticalOffset: {appState?.verticalOffset} <br/>
      verticalPage: {appState?.verticalScrollState.page} <br/>
      verticalDirection: {appState?.verticalScrollState.scrollDirection} <br/>
      horizontalOffset: {appState?.horizontalOffset} <br/>
      horizontalPage: {appState?.horizontalScrollState.page} <br/>
      horizontalDirection: {appState?.horizontalScrollState.scrollDirection} <br/>
      <AutoSizer style={{ flexGrow: 1, width: '100%'}}>
        {({height,width}) => (
      <DisplayList
        offset={appState ? appState.verticalOffset : 0}
        height={height}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={width}>
        {Row}
      </DisplayList>)}
      </AutoSizer>
    </div>
  )

  return (
    <div className="app-container">
      <label>
        Vertical Scroll To: 
        <input
          type={"number"}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            ref.current?.scrollTo(value);
          }}
        />
      </label>

      <br/>

      <label>
        Scroll Height: 
        <input
          type={"number"}
          value={scrollHeight}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            setScrollHeight(value);
          }}
        />
      </label>

      <br/>

      <label>
        Scroll Width: 
        <input
          type={"number"}
          value={scrollWidth}
          height={200}
          onChange={(event) => {
            const value = parseInt(event.target?.value);
            setScrollWidth(value);
          }}
        />
      </label>

      <VirtualScroll
        ref={ref}
        className={'outerContainer'}
        useIsScrolling={true}
        scrollHeight={scrollHeight}
        scrollWidth={scrollWidth}
        onScroll={(verticalOffset, horizontalOffset, verticalScrollState, horizontalScrollState) => {
          setAppState({ verticalOffset, horizontalOffset, verticalScrollState, horizontalScrollState })
        }}
        contentRender={contentRender}
        height={500}
        width={600}/>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)