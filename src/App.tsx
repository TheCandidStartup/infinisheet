import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import VirtualScroller from './VirtualScroller'

const SETTINGS = {
  itemHeight: 20,
  amount: 10,
  tolerance: 5,
  minIndex: -9999,
  maxIndex: 100000,
  startIndex: 1
}

const getData = (offset, limit) => {
  const data = []
  const start = Math.max(SETTINGS.minIndex, offset)
  const end = Math.min(offset + limit - 1, SETTINGS.maxIndex)
  console.log(`request [${offset}..${offset + limit - 1}] -> [${start}..${end}] items`)
  if (start <= end) {
    for (let i = start; i <= end; i++) {
      data.push({ index: i, text: `item ${i}` })
    }
  }
  return data
}

const rowTemplate = item => (
  <div className="item" key={item.index}>
    {item.text}
  </div>
)

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + TS</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <VirtualScroller className="viewport" get={getData} settings={SETTINGS} row={rowTemplate}/>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR on The Candid Startup
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
