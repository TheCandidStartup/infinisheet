import React from "react";
import { render, screen, fireEvent, act } from './test/wrapper'
import { throwErr, overrideProp, fireEventScrollEnd } from './test/utils'
import { VirtualList, VirtualListProxy } from './VirtualList'
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';
import { useVariableSizeItemOffsetMapping } from './useVariableSizeItemOffsetMapping';

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
      fireEventScrollEnd(outerDiv);
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

  it('empty list', () => {
    render(
      <VirtualList
        height={240}
        itemCount={0}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </VirtualList>
    )
    expect(screen.queryByText('Header')).toBeNull()
  })

  it('should support ref to a VirtualListProxy', () => {
    const mock = vi.fn();
    Element.prototype["scrollTo"] = mock;

    try {
      const ref = React.createRef<VirtualListProxy>();
      render(
        <VirtualList
          ref={ref}
          height={240}
          itemCount={100}
          itemOffsetMapping={mapping}
          width={600}>
          {Cell}
        </VirtualList>
      )

      const proxy = ref.current || throwErr("null ref");
      proxy.scrollTo(100);
      expect(mock).toBeCalledWith(0, 100);

      proxy.scrollToItem(42);
      expect(mock).toBeCalledWith(0, 42*30);

      proxy.scrollToItem(0);
      expect(mock).toBeCalledWith(0, 0);
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
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
      fireEventScrollEnd(outerDiv);
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

  it('should render list with no variable sizes', () => {
    const fixedMapping = useVariableSizeItemOffsetMapping(30);
    render(
      <VirtualList
        height={240}
        itemCount={100}
        itemOffsetMapping={fixedMapping}
        useIsScrolling={true}
        width={600}>
        {Cell}
      </VirtualList>
    )
    const header = screen.getByText('Header');
    expect(header).toBeInTheDocument()
    expect(header).toHaveProperty("style.top", '0px')
    expect(header).toHaveProperty("style.height", '30px')

    const item7 = screen.getByText('Item 8');
    expect(item7).toBeInTheDocument()
    expect(item7).toHaveProperty("style.top", '240px')
    expect(item7).toHaveProperty("style.height", '30px')

    expect(screen.queryByText('Item 9')).toBeNull()
  })

  it('should render list with less items than sizes', () => {
    const longMapping = useVariableSizeItemOffsetMapping(30, [50, 100, 150]);

    render(
      <VirtualList
        height={240}
        itemCount={1}
        itemOffsetMapping={longMapping}
        useIsScrolling={true}
        width={600}>
        {Cell}
      </VirtualList>
    )
    const header = screen.getByText('Header');
    expect(header).toBeInTheDocument()
    expect(header).toHaveProperty("style.top", '0px')
    expect(header).toHaveProperty("style.height", '50px')

    expect(screen.queryByText('Item 1')).toBeNull()
  })

  it('should support scrollToItem with index=-1,0,1,2', () => {
    const mock = vi.fn();
    Element.prototype["scrollTo"] = mock;

    try {
      const ref = React.createRef<VirtualListProxy>();
      render(
        <VirtualList
          ref={ref}
          height={240}
          itemCount={100}
          itemOffsetMapping={mapping}
          width={600}>
          {Cell}
        </VirtualList>
      )

      const proxy = ref.current || throwErr("null ref");
      proxy.scrollTo(100);
      expect(mock).toBeCalledWith(0, 100);

      proxy.scrollToItem(-1);
      expect(mock).toBeCalledWith(0, 0);

      proxy.scrollToItem(0);
      expect(mock).toBeCalledWith(0, 0);

      proxy.scrollToItem(1);
      expect(mock).toBeCalledWith(0, 60);

      proxy.scrollToItem(2);
      expect(mock).toBeCalledWith(0, 90);
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })
})
