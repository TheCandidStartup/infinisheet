import React from "react";
import { render, screen, fireEvent, act } from '../../../shared/test/wrapper'
import { throwErr, overrideProp, fireEventScrollEnd, stubProperty, unstubAllProperties } from '../../../shared/test/utils'
import { VirtualContainerRender } from './VirtualContainer'
import { VirtualList, VirtualListProps } from './VirtualList'
import { VirtualListProxy } from './VirtualListProxy'
import type { DisplayListItemProps } from "./DisplayList";
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';
import { useVariableSizeItemOffsetMapping } from './useVariableSizeItemOffsetMapping';

type ScrollHandler = Exclude<VirtualListProps['onScroll'], undefined>;

// Set layout related properties and find div to scroll starting
// from an item in the list.
function updateLayout(item: HTMLElement): HTMLElement {
  const displayInner = item.parentElement || throwErr("No DisplayList inner");
  const displayOuter = displayInner.parentElement || throwErr("No DisplayList outer");
  const autoInner = displayOuter.parentElement || throwErr("No AutoSizer inner");
  const autoOuter = autoInner.parentElement || throwErr("No AutoSizer outer");
  const scrollContent = autoOuter.parentElement || throwErr("No VirtualScroll content");
  const scrollOuter = scrollContent.parentElement || throwErr("No VirtualScroll outer");
  const scrollInner = scrollOuter.children[1] as HTMLElement || throwErr("No VirtualScroll inner");

  const scrollHeight = parseInt(scrollInner.style.height);
  overrideProp(scrollOuter, "scrollHeight", scrollHeight);
  const scrollWidth = parseInt(scrollInner.style.width);
  overrideProp(scrollOuter, "scrollWidth", scrollWidth);

  return scrollOuter;
}

describe('Fixed Size VirtualList', () => {
  afterEach(() => {
    unstubAllProperties();
  })

  const Cell = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div className={ index == 0 ? "header" : "cell" } style={style}>
      { (index == 0) ? "Header" : "Item " + index }
    </div>
  );
    
  const mapping = useFixedSizeItemOffsetMapping(30);
  
  it('should render and scroll', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 240);

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
    const outerDiv = updateLayout(header);

    const item1 = screen.getByText('Item 1');
    expect(item1).toBeInTheDocument()

    const item8 = screen.getByText('Item 7');
    expect(item8).toBeInTheDocument()

    expect(screen.queryByText('Item 8')).toBeNull()

    // Scroll down 4 items.
    {act(() => {
      fireEvent.scroll(outerDiv, { target: { scrollTop: 120 }});
      fireEventScrollEnd(outerDiv);
    })}
    expect(screen.queryByText('header')).toBeNull()
    expect(screen.queryByText('Item 1')).toBeNull()
    expect(screen.queryByText('Item 2')).toBeNull()
    expect(screen.queryByText('Item 3')).toBeNull()

    const item3 = screen.getByText('Item 4');
    expect(item3).toBeInTheDocument()

    // New items scrolled into view
    const item9= screen.getByText('Item 9');
    expect(item9).toBeInTheDocument()

    const item12= screen.getByText('Item 11');
    expect(item12).toBeInTheDocument()

    expect(screen.queryByText('Item 12')).toBeNull()
  })

  it('empty list', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 240);
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
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 240);
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

      const header = screen.getByText('Header');
      expect(header).toBeInTheDocument()
      updateLayout(header);

      let proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollTo(100); })}
      expect(mock).lastCalledWith({ "top": 100 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(42); })}
      expect(mock).lastCalledWith({ "top": 42*30 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(0); })}
      expect(mock).lastCalledWith({ "top":  0 });

      proxy = ref.current || throwErr("null ref");
      expect(mock).toBeCalledTimes(3);
      {act(() => { proxy.scrollToItem(1, 'visible'); })}
      expect(mock).toBeCalledTimes(3);

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(42, 'visible'); })}
      expect(mock).lastCalledWith({ "top":  42*30 - 240 + 30 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(10, 'visible'); })}
      expect(mock).lastCalledWith({ "top":  10*30 });
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })

  it('should support small viewport', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 10);
    const mock = vi.fn();
    Element.prototype["scrollTo"] = mock;

    try {
      const ref = React.createRef<VirtualListProxy>();
      render(
        <VirtualList
          ref={ref}
          height={10}
          itemCount={100}
          itemOffsetMapping={mapping}
          width={600}>
          {Cell}
        </VirtualList>
      )

      const header = screen.getByText('Header');
      expect(header).toBeInTheDocument()
      updateLayout(header);

      let proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollTo(100); })}
      expect(mock).lastCalledWith({ "top": 100 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(42); })}
      expect(mock).lastCalledWith({ "top": 42*30 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(0); })}
      expect(mock).lastCalledWith({ "top": 0 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(1, 'visible'); })}
      expect(mock).lastCalledWith({ "top": 30 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(42, 'visible'); })}
      expect(mock).lastCalledWith({ "top": 42*30 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(10, 'visible'); })}
      expect(mock).lastCalledWith({ "top": 10*30 });
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })

  it('should support horizontal layout', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 600);
    stubProperty(HTMLElement.prototype, "clientHeight", 35);
    const mock = vi.fn();
    Element.prototype["scrollTo"] = mock;

    try {
      const ref = React.createRef<VirtualListProxy>();
      render(
        <VirtualList
          ref={ref}
          height={50}
          itemCount={100}
          itemOffsetMapping={mapping}
          width={600}
          layout={'horizontal'}>
          {Cell}
        </VirtualList>
      )

      const header = screen.getByText('Header');
      expect(header).toBeInTheDocument()
      const outerDiv = updateLayout(header);
  
      const item1 = screen.getByText('Item 1');
      expect(item1).toBeInTheDocument()

      // Scroll across 4 items.
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 120 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(screen.queryByText('header')).toBeNull()
      expect(screen.queryByText('Item 1')).toBeNull()
      expect(screen.queryByText('Item 2')).toBeNull()
      expect(screen.queryByText('Item 3')).toBeNull()

      const item3 = screen.getByText('Item 4');
      expect(item3).toBeInTheDocument()

      let proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollTo(100); })}
      expect(mock).lastCalledWith({ "left": 100 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(42); })}
      expect(mock).lastCalledWith({ "left": 42*30 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(0); })}
      expect(mock).lastCalledWith({ "left": 0 });

      proxy = ref.current || throwErr("null ref");
      expect(mock).toBeCalledTimes(3);
      {act(() => { proxy.scrollToItem(1, 'visible'); })}
      expect(mock).toBeCalledTimes(3);

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(42, 'visible'); })}
      expect(mock).lastCalledWith({ "left": 42*30 - 600 + 30 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(10, 'visible'); })}
      expect(mock).lastCalledWith({ "left": 10*30 });
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })

  it('should support customization', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 50);
    const outerRender: VirtualContainerRender = ({style, ...rest}, ref) => (
      <div ref={ref} style={{ ...style, height: "500px"}} {...rest}/>
    )

    const innerRender: VirtualContainerRender = ({style, ...rest}, ref) => (
      <div ref={ref} style={{ ...style, height: "400px"}} {...rest}/>
    )

    render(
      <VirtualList
        className={"outerClass"}
        outerRender={outerRender}
        innerClassName={"innerClass"}
        innerRender={innerRender}
        height={50}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </VirtualList>
    )

    const header = screen.getByText('Header');
    expect(header).toBeInTheDocument()
    const outerDiv = updateLayout(header);
    const innerDiv = header.parentElement || throwErr("No DisplayList inner");

    expect(outerDiv).toHaveProperty("className", "outerClass")
    expect(outerDiv).toHaveProperty("style.height", '500px')
    expect(innerDiv).toHaveProperty("className", "innerClass")
    expect(innerDiv).toHaveProperty("style.height", '400px')
  })
})

describe('Variable Size VirtualList with useIsScrolling', () => {
  afterEach(() => {
    unstubAllProperties();
  })

  const Cell = ({ index, isScrolling, style }: DisplayListItemProps) => (
    <div className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
      { (index == 0) ? "Header" : "Item " + index }
    </div>
  );
    
  // Header twice the size of a normal item
  const mapping = useVariableSizeItemOffsetMapping(30, [60]);
  
  it('should render and scroll', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 240);
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
    const outerDiv = updateLayout(header);

    const item1 = screen.getByText('Item 1');
    expect(item1).toBeInTheDocument()

    // Should be one less item than fixed size case
    const item7 = screen.getByText('Item 6');
    expect(item7).toBeInTheDocument()

    expect(screen.queryByText('Item 7')).toBeNull()

    // Check that trying to scroll past the end is handled sensibly
    // Send scrollEnd separately so can check isScrolling property works
    {act(() => {
      fireEvent.scroll(outerDiv, { target: { scrollTop: 5000 }});
    })}
    expect(screen.queryByText('header')).toBeNull()
    expect(screen.queryByText('Item 1')).toBeNull()
    expect(screen.queryByText('Item 91')).toBeNull()

    let item91 = screen.getByText('Item 92');
    expect(item91).toBeInTheDocument()
    expect(item91).toHaveProperty("className", 'cellScroll')

    // Last item in list should be visible
    let item99 = screen.getByText('Item 99');
    expect(item99).toBeInTheDocument()

    expect(screen.queryByText('Item 100')).toBeNull()

    {act(() => {
      fireEventScrollEnd(outerDiv);
    })}

    item91 = screen.getByText('Item 92');
    expect(item91).toBeInTheDocument()
    expect(item91).toHaveProperty("className", 'cell')

    item99 = screen.getByText('Item 99');
    expect(item99).toBeInTheDocument()
    expect(item99).toHaveProperty("className", 'cell')
  })

  it('should render list with no variable sizes', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 240);
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

    const item7 = screen.getByText('Item 7');
    expect(item7).toBeInTheDocument()

    expect(screen.queryByText('Item 8')).toBeNull()
  })

  it('should render list with less items than sizes', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 240);
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

    expect(screen.queryByText('Item 1')).toBeNull()
  })

  it('should support scrollToItem with index=-1,0,1,2', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 240);
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
      {act(() => { proxy.scrollTo(100); })}
      expect(mock).lastCalledWith({ "top": 100 });

      {act(() => { proxy.scrollToItem(-1); })}
      expect(mock).lastCalledWith({ "top": 0 });

      {act(() => { proxy.scrollToItem(0); })}
      expect(mock).lastCalledWith({ "top": 0 });

      {act(() => { proxy.scrollToItem(1); })}
      expect(mock).lastCalledWith({ "top": 60 });

      {act(() => { proxy.scrollToItem(2); })}
      expect(mock).lastCalledWith({ "top": 90 });
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })
})

describe('Paged VirtualList', () => {
  afterEach(() => {
    unstubAllProperties();
  })

  const Cell = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div className={ index == 0 ? "header" : "cell" } style={style}>
      { (index == 0) ? "Header" : "Item " + index }
    </div>
  );
    
  const mapping = useFixedSizeItemOffsetMapping(30);
  
  it('should manipulate the scroll bar position for vertical layout', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 240);
    try {
      const onScroll = vi.fn<ScrollHandler>();
      const ref = React.createRef<VirtualListProxy>();
      render(
        <VirtualList
          ref={ref}
          height={240}
          itemCount={1000000000000}
          itemOffsetMapping={mapping}
          layout={'vertical'}
          onScroll={onScroll}
          width={600}>
          {Cell}
        </VirtualList>
      )

      const header = screen.getByText('Header');
      expect(header).toBeInTheDocument()
      const outerDiv = updateLayout(header);
  
      const mock = vi.fn()
      Element.prototype["scrollTo"] = mock;

      // Scroll to last item on first page
      let proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(1999); })}
      expect(mock).lastCalledWith({ "top": 59970 });

      // If there was an actual implementation of scrollTo it
      // would have updated scrollTop and sent events as a side effect
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 0, scrollTop: 59970 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(59970, { scrollOffset: 59970, renderOffset: 0, page: 0, scrollDirection: 'forward'})
      expect(proxy.offset).toBe(59970);

      const item1999 = screen.getByText('Item 1999');
      expect(item1999).toBeInTheDocument()

      // Scroll down 2 items to cross page boundary
      // Scroll bar should not be adjusted on first boundary
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollTop: 60030 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(60030, { scrollOffset: 60030, renderOffset: 0, page: 1, scrollDirection: 'forward'})
      expect(outerDiv).toHaveProperty("scrollTop", 60030);
      const item2001 = screen.getByText('Item 2001');
      expect(item2001).toBeInTheDocument()

      // Scroll to last item on second page
      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(3999); })}
      expect(mock).lastCalledWith({ "top": 119970 });

      // Resulting update of ScrollTop
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 0, scrollTop: 119970 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(119970, { scrollOffset: 119970, renderOffset: 0, page: 1, scrollDirection: 'forward'})
      expect(proxy.offset).toBe(119970);

      const item3999 = screen.getByText('Item 3999');
      expect(item3999).toBeInTheDocument()

      // Scroll down 2 items to cross page boundary
      // Scroll bar should be adjusted backwards by size of page
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollTop: 120030 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(120030, { scrollOffset: 60030, renderOffset: 60000, page: 2, scrollDirection: 'forward'})
      expect(mock).lastCalledWith(0, 60030);
      const item4001 = screen.getByText('Item 4001');
      expect(item4001).toBeInTheDocument()

      // Scroll back to first item
      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(0); })}
      expect(mock).lastCalledWith({ "top": 0 });

      // Resulting update of ScrollTop
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 0, scrollTop: 0 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(0, { scrollOffset: 0, renderOffset: 0, page: 0, scrollDirection: 'backward'})

      const item1 = screen.getByText('Item 1');
      expect(item1).toBeInTheDocument()

    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })

  it('should manipulate the scroll bar position for horizontal layout', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 600);
    stubProperty(HTMLElement.prototype, "clientHeight", 35);
    try {
      const onScroll = vi.fn<ScrollHandler>();
      const ref = React.createRef<VirtualListProxy>();
      render(
        <VirtualList
          ref={ref}
          height={50}
          itemCount={1000000000000}
          itemOffsetMapping={mapping}
          layout={'horizontal'}
          onScroll={onScroll}
          width={600}>
          {Cell}
        </VirtualList>
      )

      const header = screen.getByText('Header');
      expect(header).toBeInTheDocument()
      const outerDiv = updateLayout(header);

      const mock = vi.fn()
      Element.prototype["scrollTo"] = mock;

      // Scroll to last item on first page
      let proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(1999); })}
      expect(mock).lastCalledWith({ "left": 59970 });

      // If there was an actual implementation of scrollTo it
      // would have updated scrollLeft and sent events as a side effect
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 59970, scrollTop: 0 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(59970, { scrollOffset: 59970, renderOffset: 0, page: 0, scrollDirection: 'forward'})
      expect(proxy.offset).toBe(59970);

      const item1999 = screen.getByText('Item 1999');
      expect(item1999).toBeInTheDocument()

      // Scroll down 2 items to cross page boundary
      // Scroll bar should not be adjusted on first boundary
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 60030 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(60030, { scrollOffset: 60030, renderOffset: 0, page: 1, scrollDirection: 'forward'})
      expect(outerDiv).toHaveProperty("scrollLeft", 60030);
      const item2001 = screen.getByText('Item 2001');
      expect(item2001).toBeInTheDocument()

      // Scroll to last item on second page
      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(3999); })}
      expect(mock).lastCalledWith({ "left": 119970 });

      // Resulting update of ScrollTop
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 119970, scrollTop: 0 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(119970, { scrollOffset: 119970, renderOffset: 0, page: 1, scrollDirection: 'forward'})
      expect(proxy.offset).toBe(119970);

      const item3999 = screen.getByText('Item 3999');
      expect(item3999).toBeInTheDocument()

      // Scroll down 2 items to cross page boundary
      // Scroll bar should be adjusted backwards by size of page
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 120030 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(120030, { scrollOffset: 60030, renderOffset: 60000, page: 2, scrollDirection: 'forward'})
      expect(mock).lastCalledWith(60030, 0);
      const item4001 = screen.getByText('Item 4001');
      expect(item4001).toBeInTheDocument()

    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })

})