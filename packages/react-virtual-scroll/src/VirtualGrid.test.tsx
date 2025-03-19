import React from "react";
import { render, screen, fireEvent, act } from '../../../shared/test/wrapper'
import { throwErr, overrideProp, fireEventScrollEnd, stubProperty, unstubAllProperties } from '../../../shared/test/utils'
import { VirtualContainerRender } from './VirtualContainer'
import { VirtualGrid, VirtualGridProps } from './VirtualGrid'
import { VirtualGridProxy } from './VirtualGridProxy'
import type { DisplayGridItemProps } from "./DisplayGrid";
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';
import { useVariableSizeItemOffsetMapping } from './useVariableSizeItemOffsetMapping';

type ScrollHandler = Exclude<VirtualGridProps['onScroll'], undefined>;

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

describe('VirtualGrid', () => {
  afterEach(() => {
    unstubAllProperties();
  })

  const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
    <div className={ rowIndex == 0 ? "header" : "cell" } style={style}>
      { (rowIndex == 0) ? `Header ${columnIndex}` : `Cell ${rowIndex}:${columnIndex}` }
    </div>
  );
    
  const rowMapping = useVariableSizeItemOffsetMapping(30, [50]);
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  
  it('should render and scroll', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualGrid
        height={240}
        rowCount={100}
        rowOffsetMapping={rowMapping}
        columnCount={100}
        columnOffsetMapping={columnMapping}
        width={600}>
        {Cell}
      </VirtualGrid>
    )
    const header = screen.getByText('Header 0');
    expect(header).toBeInTheDocument()
    const outerDiv = updateLayout(header);

    const item1 = screen.getByText('Cell 1:0');
    expect(item1).toBeInTheDocument()

    const item1a = screen.getByText('Cell 1:1');
    expect(item1a).toBeInTheDocument()

    const item8 = screen.getByText('Cell 6:0');
    expect(item8).toBeInTheDocument()

    const item8a = screen.getByText('Cell 6:5');
    expect(item8a).toBeInTheDocument()

    expect(screen.queryByText('Cell 7:0')).toBeNull()
    expect(screen.queryByText('Cell 0:6')).toBeNull()
    expect(screen.queryByText('Cell 7:6')).toBeNull()

    // Scroll down 4 rows and across 3 rows
    {act(() => {
      fireEvent.scroll(outerDiv, { target: { scrollTop: 140, scrollLeft: 300 }});
      fireEventScrollEnd(outerDiv);
    })}
    expect(screen.queryByText('Header 0')).toBeNull()
    expect(screen.queryByText('Cell 1:0')).toBeNull()
    expect(screen.queryByText('Cell 2:0')).toBeNull()
    expect(screen.queryByText('Header 1')).toBeNull()
    expect(screen.queryByText('Cell 1:1')).toBeNull()
    expect(screen.queryByText('Cell 2:1')).toBeNull()

    // Overscan should render one item before the start of the visible window
    const item3 = screen.getByText('Cell 4:3');
    expect(item3).toBeInTheDocument()

    // New items scrolled into view
    const item9 = screen.getByText('Cell 9:3');
    expect(item9).toBeInTheDocument()

    const item12 = screen.getByText('Cell 11:8');
    expect(item12).toBeInTheDocument()

    expect(screen.queryByText('Cell 12:0')).toBeNull()
    expect(screen.queryByText('Cell 11:9')).toBeNull()
  })

  it('empty grid', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);
    render(
      <VirtualGrid
      height={240}
      rowCount={0}
      rowOffsetMapping={rowMapping}
      columnCount={0}
      columnOffsetMapping={columnMapping}
      width={600}>
      {Cell}
      </VirtualGrid>
    )
    expect(screen.queryByText('Header 0')).toBeNull()
  })

  it('should support ref to a VirtualGridProxy', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);

    const mock = vi.fn();
    Element.prototype["scrollTo"] = mock;

    try {
      const ref = React.createRef<VirtualGridProxy>();
      render(
        <VirtualGrid
        ref={ref}
        height={240}
        rowCount={100}
        rowOffsetMapping={rowMapping}
        columnCount={100}
        columnOffsetMapping={columnMapping}
        width={600}>
        {Cell}
      </VirtualGrid>
      )

      const header = screen.getByText('Header 0');
      updateLayout(header);

      let proxy = ref.current || throwErr("null ref");
      expect(proxy.clientWidth).toBe(585);
      expect(proxy.clientHeight).toBe(225);
      expect(proxy.verticalOffset).toBe(0);
      expect(proxy.horizontalOffset).toBe(0);

      {act(() => { proxy.scrollTo(100, 200); })}
      expect(mock).lastCalledWith({ left: 200, top: 100 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(42, 7); })}
      expect(mock).lastCalledWith({ left: 700, top: 41*30+50 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(0, 0); })}
      expect(mock).lastCalledWith({ left: 0, top: 0 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(42); })}
      expect(mock).lastCalledWith({ top: 41*30+50 });

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(undefined, 7); })}
      expect(mock).lastCalledWith({ left: 700 });

      proxy = ref.current || throwErr("null ref");
      expect(mock).toBeCalledTimes(5);
      {act(() => { proxy.scrollToItem(43, 8, 'visible'); })}
      expect(mock).toBeCalledTimes(5);

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(80, 50, 'visible'); })}
      expect(mock).lastCalledWith({ left: 50*100-585+100, top: 79*30+50-225+30});
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })

  it('should support customization', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 35);

    const outerRender: VirtualContainerRender = ({style, ...rest}, ref) => (
      <div ref={ref} style={{ ...style, height: "500px"}} {...rest}/>
    )

    const innerRender: VirtualContainerRender = ({style, ...rest}, ref) => (
      <div ref={ref} style={{ ...style, height: "400px"}} {...rest}/>
    )

    render(
      <VirtualGrid
        className={"outerClass"}
        outerRender={outerRender}
        innerClassName={"innerClass"}
        innerRender={innerRender}
        height={50}
        rowCount={240}
        rowOffsetMapping={rowMapping}
        columnCount={100}
        columnOffsetMapping={columnMapping}
        width={600}>
        {Cell}
      </VirtualGrid>
    )

    const header = screen.getByText('Header 0');
    const outerDiv = updateLayout(header);
    const innerDiv = header.parentElement || throwErr("No DisplayList inner");

    expect(outerDiv).toHaveProperty("className", "outerClass")
    expect(outerDiv).toHaveProperty("style.height", '500px')
    expect(innerDiv).toHaveProperty("className", "innerClass")
    expect(innerDiv).toHaveProperty("style.height", '400px')
  })
})

describe('VirtualGrid with useIsScrolling', () => {
  afterEach(() => {
    unstubAllProperties();
  })

  const Cell = ({ rowIndex, columnIndex, isScrolling, style }: DisplayGridItemProps) => (
    <div className={ rowIndex == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
      { (rowIndex == 0) ? `Header ${columnIndex}` : `Cell ${rowIndex}:${columnIndex}` }
    </div>
  );
    
  const rowMapping = useVariableSizeItemOffsetMapping(30, [60]);
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  
  it('should render and scroll', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);

    render(
      <VirtualGrid
        height={240}
        rowCount={100}
        rowOffsetMapping={rowMapping}
        columnCount={100}
        columnOffsetMapping={columnMapping}
        useIsScrolling={true}
        width={600}>
        {Cell}
      </VirtualGrid>
    )
    const header = screen.getByText('Header 0');
    expect(header).toBeInTheDocument()
    const outerDiv = updateLayout(header);

    const item1 = screen.getByText('Cell 1:0');
    expect(item1).toBeInTheDocument()

    const item7 = screen.getByText('Cell 6:0');
    expect(item7).toBeInTheDocument()

    expect(screen.queryByText('Cell 7:0')).toBeNull()

    // Check that trying to scroll past the end is handled sensibly
    // Send scrollEnd separately so can check isScrolling property works
    {act(() => {
      fireEvent.scroll(outerDiv, { target: { scrollTop: 5000 }});
    })}
    expect(screen.queryByText('header 0')).toBeNull()
    expect(screen.queryByText('Cell 1:0')).toBeNull()
    expect(screen.queryByText('Cell 90:0')).toBeNull()

    let item91 = screen.getByText('Cell 92:0');
    expect(item91).toBeInTheDocument()
    expect(item91).toHaveProperty("className", 'cellScroll')

    // Last item in list should be visible
    let item99 = screen.getByText('Cell 99:0');
    expect(item99).toBeInTheDocument()

    expect(screen.queryByText('Cell 100:0')).toBeNull()

    {act(() => {
      fireEventScrollEnd(outerDiv);
    })}

    item91 = screen.getByText('Cell 92:0');
    expect(item91).toBeInTheDocument()
    expect(item91).toHaveProperty("className", 'cell')

    item99 = screen.getByText('Cell 99:0');
    expect(item99).toBeInTheDocument()
    expect(item99).toHaveProperty("className", 'cell')
  })
})

describe('Paged VirtualGrid', () => {
  afterEach(() => {
    unstubAllProperties();
  })

  const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
    <div className={ rowIndex == 0 ? "header" : "cell" } style={style}>
      { (rowIndex == 0) ? `Header ${columnIndex}` : `Cell ${rowIndex}:${columnIndex}` }
    </div>
  );
    
  const rowMapping = useFixedSizeItemOffsetMapping(30);
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  
  it('should manipulate the scroll bar position', () => {
    stubProperty(HTMLElement.prototype, "clientWidth", 585);
    stubProperty(HTMLElement.prototype, "clientHeight", 225);

    try {
      const onScroll = vi.fn<ScrollHandler>();
      const ref = React.createRef<VirtualGridProxy>();
      render(
        <VirtualGrid
        ref={ref}
        height={240}
        rowCount={1000000000000}
        rowOffsetMapping={rowMapping}
        columnCount={1000000000000}
        columnOffsetMapping={columnMapping}
        onScroll={onScroll}
        width={600}>
        {Cell}
      </VirtualGrid>
      )

      const header = screen.getByText('Header 0');
      expect(header).toBeInTheDocument()
      const outerDiv = updateLayout(header);

      const mock = vi.fn()
      Element.prototype["scrollTo"] = mock;

      // Scroll to last item on second page
      let proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(3999, 1199); })}
      expect(mock).lastCalledWith({ left: 119900, top: 119970 });

      // Resulting update of ScrollTop
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 119900, scrollTop: 119970 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(119970, 119900, { scrollOffset: 119970, renderOffset: 0, page: 1, scrollDirection: 'forward'},
        { scrollOffset: 119900, renderOffset: 0, page: 1, scrollDirection: 'forward'});
      expect(proxy.verticalOffset).toBe(119970);
      expect(proxy.horizontalOffset).toBe(119900);
      const item3999 = screen.getByText('Cell 3999:1199');
      expect(item3999).toBeInTheDocument()

      // Scroll down 2 items to cross page boundary
      // Scroll bar should be adjusted backwards by size of page
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 120100, scrollTop: 120030 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(mock).lastCalledWith(60100, 60030);
      expect(onScroll).lastCalledWith(120030, 120100, { scrollOffset: 60030, renderOffset: 60000, page: 2, scrollDirection: 'forward'},
        { scrollOffset: 60100, renderOffset: 60000, page: 2, scrollDirection: 'forward'});
      const item4001 = screen.getByText('Cell 4001:1201');
      expect(item4001).toBeInTheDocument()

      // Scroll back to first cell
      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(0, 0); })}
      expect(mock).lastCalledWith({ left: 0, top: 0});

      // Resulting update of ScrollTop
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 0, scrollTop: 0 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(0, 0, { scrollOffset: 0, renderOffset: 0, page: 0, scrollDirection: 'backward'},
        { scrollOffset: 0, renderOffset: 0, page: 0, scrollDirection: 'backward'});
      const item1 = screen.getByText('Cell 1:1');
      expect(item1).toBeInTheDocument()

    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })
})