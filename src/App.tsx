import './App.css'
import { FixedSizeGrid as Grid } from 'react-window';
 
const Cell = ({ columnIndex, rowIndex, style } : { columnIndex: number, rowIndex: number, style: any }) => (
  <div className="cell" style={style}>
    Item {rowIndex},{columnIndex}
  </div>
);

function App() {
  return (
    <div className="app-container">
      <Grid
        columnCount={1000000}
        columnWidth={200}
        height={240}
        rowCount={1000000}
        rowHeight={30}
        width={600}>
          {Cell}
      </Grid>
    </div>
  )
}

export default App
