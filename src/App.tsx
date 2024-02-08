import './App.css'
import { VirtualList } from './VirtualList';
import { useVariableSizeItemOffsetMapping } from './useVariableSizeItemOffsetMapping';

const Cell = ({ index, style }: { index: number, style: any }) => (
  <div className={ index == 0 ? "header" : "cell" } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function App() {
  var mapping = useVariableSizeItemOffsetMapping(30, [50]);

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
