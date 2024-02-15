import './App.css'
import { VirtualList } from './VirtualList';
import { useVariableSizeItemOffsetMapping } from './useVariableSizeItemOffsetMapping';

const Cell = ({ index, isScrolling, style }: { index: number, isScrolling?: boolean, style: any }) => (
  <div className={ index == 0 ? "header" : "cell" } style={style}>
    { (index == 0) ? "Header" : (isScrolling ? "Scroll " : "Item ") + index }
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
        useIsScrolling={true}
        width={600}>
        {Cell}
      </VirtualList>
    </div>
  )
}

export default App
