import { render, screen } from './test/wrapper'
import { VirtualList } from './VirtualList'
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';

describe('Fixed Size VirtualList', () => {
  const Cell = ({ index, style }: { index: number, style: any }) => (
    <div className={ index == 0 ? "header" : "cell" } style={style}>
      { (index == 0) ? "Header" : "Item " + index }
    </div>
  );
    
  const mapping = useFixedSizeItemOffsetMapping(30);
  
  it('should default to rendering the top of the list', () => {
    render(
      <VirtualList
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </VirtualList>
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Item 9')).toBeNull()
  })
})
