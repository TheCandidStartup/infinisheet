import React, { Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { VirtualScroll, VirtualScrollProxy, ScrollState } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

interface AppState {
  verticalOffset: number,
  horizontalOffset: number, 
  verticalScrollState: ScrollState,
  horizontalScrollState: ScrollState
}

function App() {
  const [appState, setAppState] = React.useState<AppState|null>(null);
  const ref = React.useRef<VirtualScrollProxy>(null);
  const [scrollHeight, setScrollHeight] = React.useState<number>(3200);
  const [scrollWidth, setScrollWidth] = React.useState<number>(0);

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
        innerRender={({style, ...rest}, ref) => (
          <div ref={ref} style={{display: 'flex', flexDirection: 'column', ...style}} {...rest}/>
        )}
        height={200}
        width={600}>
        {({ isScrolling }) => (
          <Fragment>
            isScrolling: {isScrolling ? 'true' : 'false'} <br/>
            verticalOffset: {appState?.verticalOffset} <br/>
            verticalPage: {appState?.verticalScrollState.page} <br/>
            verticalDirection: {appState?.verticalScrollState.scrollDirection} <br/>
            horizontalOffset: {appState?.horizontalOffset} <br/>
            horizontalPage: {appState?.horizontalScrollState.page} <br/>
            horizontalDirection: {appState?.horizontalScrollState.scrollDirection} <br/>
          </Fragment>
        )}
      </VirtualScroll>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)