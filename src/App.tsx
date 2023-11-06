import './App.css'
// @ts-ignore
import VirtualScroller from './VirtualScroller'
import { FixedSizeList as List } from 'react-window'

const SETTINGS = {
  itemHeight: 20,
  amount: 10,
  tolerance: 5,
  minIndex: -999,
  maxIndex: 1000,
  startIndex: 1
}

const getData = (offset: number, limit: number):any[] => {
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

function MyText({ text } : { text: string }) {
  return (
    <>{text}</>
  )
}

const rowTemplate = (item: any) => (
  <div className="item" key={item.index}>
    <MyText text={item.text as string} key={item.index} />
  </div>
)

const Row = ({ index, style } : { index: number, style: any }) => (
  <div style={style}>Row {index}</div>
);

function App() {
  return (
    <>
      <div>
        <VirtualScroller className="viewport" get={getData} settings={SETTINGS} row={rowTemplate}/>
      </div>
      <p></p>
      <div>
      <List
        height={SETTINGS.itemHeight*SETTINGS.amount}
        itemCount={SETTINGS.maxIndex - SETTINGS.minIndex}
        itemSize={SETTINGS.itemHeight}>
          {Row}
      </List>
      </div>
    </>
  )
}

export default App
