import React from "react";
import { render, screen, fireEvent, act } from '../../../shared/test/wrapper'
import { throwErr, overrideProp, fireEventScrollEnd } from '../../../shared/test/utils'
import { VirtualInnerRender, VirtualOuterRender } from './VirtualBase'
import { VirtualGrid, VirtualGridProxy } from './VirtualGrid'
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';
import { useVariableSizeItemOffsetMapping } from './useVariableSizeItemOffsetMapping';
import { ScrollState } from './useVirtualScroll';

function updateLayout(innerDiv: HTMLElement, outerDiv: HTMLElement) {
  const scrollHeight = parseInt(innerDiv.style.height);
  overrideProp(outerDiv, "scrollHeight", scrollHeight);
  const scrollWidth = parseInt(innerDiv.style.width);
  overrideProp(outerDiv, "scrollWidth", scrollWidth);

  const clientHeight = parseInt(outerDiv.style.height);
  overrideProp(outerDiv, "clientHeight", clientHeight);
  const clientWidth = parseInt(outerDiv.style.width);
  overrideProp(outerDiv, "clientWidth", clientWidth);
}

describe('VirtualGrid', () => {
  const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
    <div className={ rowIndex == 0 ? "header" : "cell" } style={style}>
      { (rowIndex == 0) ? `Header ${columnIndex}` : `Cell ${rowIndex}:${columnIndex}` }
    </div>
  );
    
  const rowMapping = useVariableSizeItemOffsetMapping(30, [50]);
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  
  it('should render and scroll', () => {
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
    expect(header).toHaveProperty("style.top", '0px')
    expect(header).toHaveProperty("style.left", '0px')
    expect(header).toHaveProperty("style.height", '50px')
    expect(header).toHaveProperty("style.width", '100px')

    const item1 = screen.getByText('Cell 1:0');
    expect(item1).toBeInTheDocument()
    expect(item1).toHaveProperty("style.top", '50px')
    expect(item1).toHaveProperty("style.left", '0px')
    expect(item1).toHaveProperty("style.height", '30px')
    expect(item1).toHaveProperty("style.width", '100px')

    const item1a = screen.getByText('Cell 1:1');
    expect(item1a).toBeInTheDocument()
    expect(item1a).toHaveProperty("style.top", '50px')
    expect(item1a).toHaveProperty("style.left", '100px')
    expect(item1a).toHaveProperty("style.height", '30px')
    expect(item1a).toHaveProperty("style.width", '100px')

    // Overscan should render one item after visible window
    const item8 = screen.getByText('Cell 8:0');
    expect(item8).toBeInTheDocument()
    expect(item8).toHaveProperty("style.top", '260px')
    expect(item8).toHaveProperty("style.left", '0px')
    expect(item8).toHaveProperty("style.height", '30px')
    expect(item8).toHaveProperty("style.width", '100px')

    const item8a = screen.getByText('Cell 8:6');
    expect(item8a).toBeInTheDocument()
    expect(item8a).toHaveProperty("style.top", '260px')
    expect(item8a).toHaveProperty("style.left", '600px')
    expect(item8a).toHaveProperty("style.height", '30px')
    expect(item8a).toHaveProperty("style.width", '100px')

    expect(screen.queryByText('Cell 9:0')).toBeNull()
    expect(screen.queryByText('Cell 0:7')).toBeNull()
    expect(screen.queryByText('Cell 9:7')).toBeNull()

    const innerDiv = header.parentElement || throwErr("No inner div");
    const outerDiv = innerDiv.parentElement || throwErr("No outer div");
    updateLayout(innerDiv, outerDiv);

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
    const item3 = screen.getByText('Cell 3:2');
    expect(item3).toBeInTheDocument()
    expect(item3).toHaveProperty("style.top", '110px')
    expect(item3).toHaveProperty("style.left", '200px')
    expect(item3).toHaveProperty("style.height", '30px')
    expect(item3).toHaveProperty("style.width", '100px')

    // New items scrolled into view
    const item9 = screen.getByText('Cell 9:3');
    expect(item9).toBeInTheDocument()
    expect(item9).toHaveProperty("style.top", '290px')
    expect(item9).toHaveProperty("style.left", '300px')
    expect(item9).toHaveProperty("style.height", '30px')
    expect(item9).toHaveProperty("style.width", '100px')

    const item12 = screen.getByText('Cell 12:9');
    expect(item12).toBeInTheDocument()
    expect(item12).toHaveProperty("style.top", '380px')
    expect(item12).toHaveProperty("style.left", '900px')
    expect(item12).toHaveProperty("style.height", '30px')
    expect(item12).toHaveProperty("style.width", '100px')

    expect(screen.queryByText('Cell 13:0')).toBeNull()
    expect(screen.queryByText('Cell 12:10')).toBeNull()
  })

  it('empty grid', () => {
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
      const innerDiv = header.parentElement || throwErr("No inner div");
      const outerDiv = innerDiv.parentElement || throwErr("No outer div");
      updateLayout(innerDiv, outerDiv);

      let proxy = ref.current || throwErr("null ref");
      expect(proxy.clientWidth).toBe(600);
      expect(proxy.clientHeight).toBe(240);

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
      {act(() => { proxy.scrollToItem(43, 8, 'visible'); })}
      expect(mock).lastCalledWith({});

      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(80, 50, 'visible'); })}
      expect(mock).lastCalledWith({ left: 50*100-600+100, top: 79*30+50-240+30});
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })

  it('should support customization', () => {
    const outerRender: VirtualOuterRender = ({style, ...rest}, ref) => (
      <div ref={ref} style={{ ...style, height: "500px"}} {...rest}/>
    )

    const innerRender: VirtualInnerRender = ({style, ...rest}, ref) => (
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
    const innerDiv = header.parentElement || throwErr("No inner div");
    const outerDiv = innerDiv.parentElement || throwErr("No outer div");

    expect(outerDiv).toHaveProperty("className", "outerClass")
    expect(outerDiv).toHaveProperty("style.height", '500px')
    expect(innerDiv).toHaveProperty("className", "innerClass")
    expect(innerDiv).toHaveProperty("style.height", '400px')
  })
})

describe('VirtualGrid with useIsScrolling', () => {
  const Cell = ({ rowIndex, columnIndex, isScrolling, style }: 
                { rowIndex: number, columnIndex: number, isScrolling?: boolean, style: React.CSSProperties }) => (
    <div className={ rowIndex == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
      { (rowIndex == 0) ? `Header ${columnIndex}` : `Cell ${rowIndex}:${columnIndex}` }
    </div>
  );
    
  const rowMapping = useVariableSizeItemOffsetMapping(30, [60]);
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  
  it('should render and scroll', () => {
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
    expect(header).toHaveProperty("style.top", '0px')
    expect(header).toHaveProperty("style.height", '60px')

    const item1 = screen.getByText('Cell 1:0');
    expect(item1).toBeInTheDocument()
    expect(item1).toHaveProperty("style.top", '60px')
    expect(item1).toHaveProperty("style.height", '30px')

    // Should be one less item than fixed size case
    const item7 = screen.getByText('Cell 7:0');
    expect(item7).toBeInTheDocument()
    expect(item7).toHaveProperty("style.top", '240px')
    expect(item7).toHaveProperty("style.height", '30px')

    expect(screen.queryByText('Cell 8:0')).toBeNull()

    const innerDiv = header.parentElement || throwErr("No inner div");
    const outerDiv = innerDiv.parentElement || throwErr("No outer div");
    updateLayout(innerDiv, outerDiv);

    // Check that trying to scroll past the end is handled sensibly
    // Send scrollEnd separately so can check isScrolling property works
    {act(() => {
      fireEvent.scroll(outerDiv, { target: { scrollTop: 5000 }});
    })}
    expect(screen.queryByText('header 0')).toBeNull()
    expect(screen.queryByText('Cell 1:0')).toBeNull()
    expect(screen.queryByText('Cell 90:0')).toBeNull()

    // Overscan should render one item before the start of the visible window
    let item91 = screen.getByText('Cell 91:0');
    expect(item91).toBeInTheDocument()
    expect(item91).toHaveProperty("style.top", '2760px')
    expect(item91).toHaveProperty("style.height", '30px')
    expect(item91).toHaveProperty("className", 'cellScroll')

    // Last item in list should be visible
    let item99 = screen.getByText('Cell 99:0');
    expect(item99).toBeInTheDocument()
    expect(item99).toHaveProperty("style.top", '3000px')
    expect(item99).toHaveProperty("style.height", '30px')

    expect(screen.queryByText('Cell 100:0')).toBeNull()

    {act(() => {
      fireEventScrollEnd(outerDiv);
    })}

    item91 = screen.getByText('Cell 91:0');
    expect(item91).toBeInTheDocument()
    expect(item91).toHaveProperty("style.top", '2760px')
    expect(item91).toHaveProperty("style.height", '30px')
    expect(item91).toHaveProperty("className", 'cell')

    item99 = screen.getByText('Cell 99:0');
    expect(item99).toBeInTheDocument()
    expect(item99).toHaveProperty("style.top", '3000px')
    expect(item99).toHaveProperty("style.height", '30px')
    expect(item99).toHaveProperty("className", 'cell')
  })
})

describe('Paged VirtualList', () => {
  const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
    <div className={ rowIndex == 0 ? "header" : "cell" } style={style}>
      { (rowIndex == 0) ? `Header ${columnIndex}` : `Cell ${rowIndex}:${columnIndex}` }
    </div>
  );
    
  const rowMapping = useFixedSizeItemOffsetMapping(30);
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  
  it('should manipulate the scroll bar position', () => {
    try {
      const onScroll = vi.fn<[number,number,ScrollState,ScrollState],void>();
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
      expect(header).toHaveProperty("style.top", '0px')

      const innerDiv = header.parentElement || throwErr("No inner div");
      const outerDiv = innerDiv.parentElement || throwErr("No outer div");
      updateLayout(innerDiv, outerDiv);

      const mock = vi.fn()
      Element.prototype["scrollTo"] = mock;

      // Scroll to last item on second page
      let proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(3999, 1199); })}
      expect(mock).lastCalledWith({ left: 119900, top: 119970 });
      const item3999 = screen.getByText('Cell 3999:1199');
      expect(item3999).toBeInTheDocument()
      expect(item3999).toHaveProperty("style.top", '119970px')
      expect(item3999).toHaveProperty("style.left", '119900px')

      // Resulting update of ScrollTop
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 119900, scrollTop: 119970 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(119970, 119900, { scrollOffset: 119970, renderOffset: 0, page: 1, scrollDirection: 'forward'},
        { scrollOffset: 119900, renderOffset: 0, page: 1, scrollDirection: 'forward'});

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
      expect(item4001).toHaveProperty("style.top", '60030px')
      expect(item4001).toHaveProperty("style.left", '60100px')

      // Scroll back to first cell
      proxy = ref.current || throwErr("null ref");
      {act(() => { proxy.scrollToItem(0, 0); })}
      expect(mock).lastCalledWith({ left: 0, top: 0});
      const item1 = screen.getByText('Cell 1:1');
      expect(item1).toBeInTheDocument()
      expect(item1).toHaveProperty("style.top", '30px')
      expect(item1).toHaveProperty("style.left", '100px')

      // Resulting update of ScrollTop
      {act(() => {
        fireEvent.scroll(outerDiv, { target: { scrollLeft: 0, scrollTop: 0 }});
        fireEventScrollEnd(outerDiv);
      })}
      expect(onScroll).lastCalledWith(0, 0, { scrollOffset: 0, renderOffset: 0, page: 0, scrollDirection: 'backward'},
        { scrollOffset: 0, renderOffset: 0, page: 0, scrollDirection: 'backward'});

    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })
})