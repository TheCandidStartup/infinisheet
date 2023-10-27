import './App.css'
// @ts-ignore
import VirtualScroller from './VirtualScroller'

const SETTINGS = {
  itemHeight: 20,
  amount: 10,
  tolerance: 5,
  minIndex: -9999,
  maxIndex: 100000,
  startIndex: 1
}

const getData = (offset: number, limit: number) => {
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

const rowTemplate = (item: any) => (
  <div className="item" key={item.index}>
    {item.text}
  </div>
)

function App() {
  return (
    <>
      <div>
        <VirtualScroller className="viewport" get={getData} settings={SETTINGS} row={rowTemplate}/>
      </div>
    </>
  )
}

export default App
