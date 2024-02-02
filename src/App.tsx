import './App.css'
import { VirtualList } from './VirtualList';

const Cell = ({ index, style }: { index: number, style: any }) => (
  <div className="cell" style={style}>
    Item {index}
  </div>
);

function App() {
  return (
    <div className="app-container">
      <VirtualList
        height={240}
        itemCount={100}
        itemSize={30}
        width={600}>
        {Cell}
      </VirtualList>
    </div>
  )
}

export default App
