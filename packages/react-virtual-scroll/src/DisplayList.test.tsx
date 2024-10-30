import React from "react";
import { render, screen } from '../../../shared/test/wrapper'
import { throwErr } from '../../../shared/test/utils'
import { DisplayList } from './DisplayList'
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';

describe('DisplayList', () => {
  const Cell = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div className={ index == 0 ? "header" : "cell" } style={style}>
      { (index == 0) ? "Header" : "Item " + index }
    </div>
  );
    
  const mapping = useFixedSizeItemOffsetMapping(30);
  
  it('should render at offset 0', () => {
    render(
      <DisplayList
        offset={0}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </DisplayList>
    )
    const header = screen.getByText('Header');
    expect(header).toBeInTheDocument()

    const innerDiv = header.parentElement || throwErr("No inner div");
    expect(innerDiv).toHaveProperty("style.top", '0px')
    expect(innerDiv).toHaveProperty("style.left", '0px')
    expect(innerDiv).toHaveProperty("style.grid-template-rows", 'repeat(9,30px)')

    const item1 = screen.getByText('Item 1');
    expect(item1).toBeInTheDocument()

    // Overscan should render one item after visible window
    const item8 = screen.getByText('Item 8');
    expect(item8).toBeInTheDocument()

    expect(screen.queryByText('Item 9')).toBeNull()
  })

  it('should render at fractional offset', () => {
    render(
      <DisplayList
        offset={100}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </DisplayList>
    )

    expect(screen.queryByText('header')).toBeNull()
    expect(screen.queryByText('Item 1')).toBeNull()

    // Overscan should render one item before the start of the visible window
    const item2 = screen.getByText('Item 2');
    expect(item2).toBeInTheDocument()

    const innerDiv = item2.parentElement || throwErr("No inner div");
    expect(innerDiv).toHaveProperty("style.top", '-40px')
    expect(innerDiv).toHaveProperty("style.left", '0px')
    expect(innerDiv).toHaveProperty("style.grid-template-rows", 'repeat(11,30px)')

    // New items scrolled into view
    const item9= screen.getByText('Item 9');
    expect(item9).toBeInTheDocument()

    const item12= screen.getByText('Item 12');
    expect(item12).toBeInTheDocument()

    expect(screen.queryByText('Item 13')).toBeNull()
  })

  it('should render at negative offset', () => {
    render(
      <DisplayList
        offset={-120}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </DisplayList>
    )
    const header = screen.getByText('Header');
    expect(header).toBeInTheDocument()

    const innerDiv = header.parentElement || throwErr("No inner div");
    expect(innerDiv).toHaveProperty("style.top", '120px')
    expect(innerDiv).toHaveProperty("style.left", '0px')
    expect(innerDiv).toHaveProperty("style.grid-template-rows", 'repeat(5,30px)')

    const item1 = screen.getByText('Item 1');
    expect(item1).toBeInTheDocument()

    // Overscan should render one item after visible window
    const item8 = screen.getByText('Item 4');
    expect(item8).toBeInTheDocument()

    expect(screen.queryByText('Item 5')).toBeNull()
  })

  it('should render empty space beyond end of list', () => {
    render(
      <DisplayList
        offset={2910}
        height={240}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </DisplayList>
    )
    expect(screen.queryByText('Item 95')).toBeNull()

    const header = screen.getByText('Item 96');
    expect(header).toBeInTheDocument()

    const innerDiv = header.parentElement || throwErr("No inner div");
    expect(innerDiv).toHaveProperty("style.top", '-30px')
    expect(innerDiv).toHaveProperty("style.left", '0px')
    expect(innerDiv).toHaveProperty("style.grid-template-rows", 'repeat(4,30px)')

    const item99 = screen.getByText('Item 99');
    expect(item99).toBeInTheDocument()

    expect(screen.queryByText('Item 100')).toBeNull()
  })

  it('empty list', () => {
    render(
      <DisplayList
        offset={0}
        height={240}
        itemCount={0}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </DisplayList>
    )
    expect(screen.queryByText('Header')).toBeNull()
  })

  it('should render nothing for out of range negative offset', () => {
    render(
      <DisplayList
        offset={-5000}
        height={240}
        itemCount={1}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </DisplayList>
    )
    expect(screen.queryByText('Header')).toBeNull()
  })

  it('should render nothing for out of range positive offset', () => {
    render(
      <DisplayList
        offset={5000}
        height={240}
        itemCount={1}
        itemOffsetMapping={mapping}
        width={600}>
        {Cell}
      </DisplayList>
    )
    expect(screen.queryByText('Header')).toBeNull()
  })

  it('should support horizontal layout', () => {
    render(
      <DisplayList
        offset={120}
        height={50}
        itemCount={100}
        itemOffsetMapping={mapping}
        width={600}
        layout={'horizontal'}>
        {Cell}
      </DisplayList>
    )

    const header = screen.getByText('Item 3');
    expect(header).toBeInTheDocument()

    const innerDiv = header.parentElement || throwErr("No inner div");
    expect(innerDiv).toHaveProperty("style.top", '0px')
    expect(innerDiv).toHaveProperty("style.left", '-30px')
    expect(innerDiv).toHaveProperty("style.grid-template-columns", 'repeat(22,30px)')

    const item1 = screen.getByText('Item 4');
    expect(item1).toBeInTheDocument()

    const item24 = screen.getByText('Item 24');
    expect(item24).toBeInTheDocument()

    expect(screen.queryByText('Item 25')).toBeNull()
  })
})