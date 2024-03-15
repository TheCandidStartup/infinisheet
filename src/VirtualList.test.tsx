import { render, screen, fireEvent, act } from './test/wrapper'
import { VirtualList } from './VirtualList'
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';

// Function wrapper around throw so that it can be used in an expression like
//    const value = somethingThatIsValueOrNull || throwErr("Shouldn't be null")
function throwErr(msg: string): never {
  throw msg;
}

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
    const header = screen.getByText('Header');
    expect(header).toBeInTheDocument()
    expect(header).toHaveProperty("style.top", '0px')
    expect(header).toHaveProperty("style.height", '30px')

    const item1 = screen.getByText('Item 1');
    expect(item1).toBeInTheDocument()
    expect(item1).toHaveProperty("style.top", '30px')
    expect(item1).toHaveProperty("style.height", '30px')

    const item8 = screen.getByText('Item 8');
    expect(item8).toBeInTheDocument()
    expect(item8).toHaveProperty("style.top", '240px')
    expect(item8).toHaveProperty("style.height", '30px')

    expect(screen.queryByText('Item 9')).toBeNull()

    const innerDiv = header.parentElement || throwErr("No inner div");
    const outerDiv = innerDiv.parentElement || throwErr("No outer div");

    {act(() => {
      fireEvent.scroll(outerDiv, { target: { scrollTop: 100 }});
    })}
    expect(screen.queryByText('Item 1')).toBeNull()
  })
})
