import './App.css'
import { VirtualList } from './VirtualList';
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';

const Cell = ({ index, style }: { index: number, style: any }) => (
  <div className="cell" style={style}>
    Item {index}
  </div>
);

function App() {
  var mapping = useFixedSizeItemOffsetMapping(30);

  return (
    <div className="app-container">
      <VirtualList
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </VirtualList>
    </div>
  )
}

export default App
