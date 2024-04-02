import React from "react";
import { render, screen, fireEvent, act } from './test/wrapper'
import { throwErr, overrideProp, fireEventScrollEnd } from './test/utils'
import { VirtualGrid, VirtualGridProxy } from './VirtualGrid'
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';
import { useVariableSizeItemOffsetMapping } from './useVariableSizeItemOffsetMapping';

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
  const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: any }) => (
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

      const proxy = ref.current || throwErr("null ref");
      proxy.scrollTo(100, 200);
      expect(mock).toBeCalledWith(200, 100);

      proxy.scrollToItem(42, 7);
      expect(mock).toBeCalledWith(700, 41*30+50);

      proxy.scrollToItem(0, 0);
      expect(mock).toBeCalledWith(0, 0);
    } finally {
      Reflect.deleteProperty(Element.prototype, "scrollTo");
    }
  })
})

describe('VirtualGrid with useIsScrolling', () => {
  const Cell = ({ rowIndex, columnIndex, isScrolling, style }: { rowIndex: number, columnIndex: number, isScrolling?: boolean, style: any }) => (
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
