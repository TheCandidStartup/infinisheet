import { render, screen, fireEvent, act } from './test/wrapper'
import { VirtualList } from './VirtualList'
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';
import { useVariableSizeItemOffsetMapping } from './useVariableSizeItemOffsetMapping';

// Function wrapper around throw so that it can be used in an expression like
//    const value = somethingThatIsValueOrNull || throwErr("Shouldn't be null")
function throwErr(msg: string): never {
  throw msg;
}

// jsdom does not implement any layout. All layout related properties are defined but return 0. As they
// are layout driven properties they're read only. Mock up just enough layout logic for the tests to work.
// Need to use Object.defineProperty to override read only properties.
function overrideProp(element: HTMLElement, prop: string, val: any) {
  if (!(prop in element))
    throw `Property ${prop} doesn't exist when trying to override`;

  Object.defineProperty(element, prop, {
    value: val,
    writable: false
  });
}

function updateLayout(innerDiv: HTMLElement, outerDiv: HTMLElement) {
  const scrollHeight = parseInt(innerDiv.style.height);
  overrideProp(outerDiv, "scrollHeight", scrollHeight);

  const clientHeight = parseInt(outerDiv.style.height);
  overrideProp(outerDiv, "clientHeight", clientHeight);
}

describe('Fixed Size VirtualList', () => {
  const Cell = ({ index, style }: { index: number, style: any }) => (
    <div className={ index == 0 ? "header" : "cell" } style={style}>
      { (index == 0) ? "Header" : "Item " + index }
    </div>
  );
    
  const mapping = useFixedSizeItemOffsetMapping(30);
  
  it('should render and scroll', () => {
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

    // Overscan should render one item after visible window
    const item8 = screen.getByText('Item 8');
    expect(item8).toBeInTheDocument()
    expect(item8).toHaveProperty("style.top", '240px')
    expect(item8).toHaveProperty("style.height", '30px')

    expect(screen.queryByText('Item 9')).toBeNull()

    const innerDiv = header.parentElement || throwErr("No inner div");
    const outerDiv = innerDiv.parentElement || throwErr("No outer div");
    updateLayout(innerDiv, outerDiv);

    // Scroll down 4 items.
    {act(() => {
      fireEvent.scroll(outerDiv, { target: { scrollTop: 120 }});
      fireEvent(outerDiv, new UIEvent('scrollend'));
    })}
    expect(screen.queryByText('header')).toBeNull()
    expect(screen.queryByText('Item 1')).toBeNull()
    expect(screen.queryByText('Item 2')).toBeNull()

    // Overscan should render one item before the start of the visible window
    const item3 = screen.getByText('Item 3');
    expect(item3).toBeInTheDocument()
    expect(item3).toHaveProperty("style.top", '90px')
    expect(item3).toHaveProperty("style.height", '30px')

    // New items scrolled into view
    const item9= screen.getByText('Item 9');
    expect(item9).toBeInTheDocument()
    expect(item9).toHaveProperty("style.top", '270px')
    expect(item9).toHaveProperty("style.height", '30px')

    const item12= screen.getByText('Item 12');
    expect(item12).toBeInTheDocument()
    expect(item12).toHaveProperty("style.top", '360px')
    expect(item12).toHaveProperty("style.height", '30px')

    expect(screen.queryByText('Item 13')).toBeNull()
  })
})

describe('Variable Size VirtualList with useIsScrolling', () => {
  const Cell = ({ index, isScrolling, style }: { index: number, isScrolling?: boolean, style: any }) => (
    <div className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
      { (index == 0) ? "Header" : "Item " + index }
    </div>
  );
    
  // Header twice the size of a normal item
  const mapping = useVariableSizeItemOffsetMapping(30, [60]);
  
  it('should render and scroll', () => {
    render(
      <VirtualList
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        useIsScrolling={true}
        width={600}>
        {Cell}
      </VirtualList>
    )
    const header = screen.getByText('Header');
    expect(header).toBeInTheDocument()
    expect(header).toHaveProperty("style.top", '0px')
    expect(header).toHaveProperty("style.height", '60px')

    const item1 = screen.getByText('Item 1');
    expect(item1).toBeInTheDocument()
    expect(item1).toHaveProperty("style.top", '60px')
    expect(item1).toHaveProperty("style.height", '30px')

    // Should be one less item than fixed size case
    const item7 = screen.getByText('Item 7');
    expect(item7).toBeInTheDocument()
    expect(item7).toHaveProperty("style.top", '240px')
    expect(item7).toHaveProperty("style.height", '30px')

    expect(screen.queryByText('Item 8')).toBeNull()

    const innerDiv = header.parentElement || throwErr("No inner div");
    const outerDiv = innerDiv.parentElement || throwErr("No outer div");
    updateLayout(innerDiv, outerDiv);

    // Check that trying to scroll past the end is handled sensibly
    // Send scrollEnd separately so can check isScrolling property works
    {act(() => {
      fireEvent.scroll(outerDiv, { target: { scrollTop: 5000 }});
    })}
    expect(screen.queryByText('header')).toBeNull()
    expect(screen.queryByText('Item 1')).toBeNull()
    expect(screen.queryByText('Item 90')).toBeNull()

    // Overscan should render one item before the start of the visible window
    let item91 = screen.getByText('Item 91');
    expect(item91).toBeInTheDocument()
    expect(item91).toHaveProperty("style.top", '2760px')
    expect(item91).toHaveProperty("style.height", '30px')
    expect(item91).toHaveProperty("className", 'cellScroll')

    // Last item in list should be visible
    let item99 = screen.getByText('Item 99');
    expect(item99).toBeInTheDocument()
    expect(item99).toHaveProperty("style.top", '3000px')
    expect(item99).toHaveProperty("style.height", '30px')

    expect(screen.queryByText('Item 100')).toBeNull()

    {act(() => {
      fireEvent(outerDiv, new UIEvent('scrollend'));
    })}

    item91 = screen.getByText('Item 91');
    expect(item91).toBeInTheDocument()
    expect(item91).toHaveProperty("style.top", '2760px')
    expect(item91).toHaveProperty("style.height", '30px')
    expect(item91).toHaveProperty("className", 'cell')

    item99 = screen.getByText('Item 99');
    expect(item99).toBeInTheDocument()
    expect(item99).toHaveProperty("style.top", '3000px')
    expect(item99).toHaveProperty("style.height", '30px')
    expect(item99).toHaveProperty("className", 'cell')
  })
})
