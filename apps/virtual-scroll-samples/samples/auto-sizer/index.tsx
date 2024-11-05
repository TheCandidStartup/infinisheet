import { createRoot } from 'react-dom/client';
import { AutoSizer } from '@candidstartup/react-virtual-scroll';

import '../styles.css';

function App() {
  return (
    <div style={{ width: '80vw', height: '80vh', backgroundColor: 'lightgrey' }}>
      <AutoSizer style={{ width: '100%', height: '100%' }}>
        {({width, height}) => (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: width, height: height }}>
            width: {width} <br/>
            height: {height} <br/>
          </div>
        )}
      </AutoSizer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)