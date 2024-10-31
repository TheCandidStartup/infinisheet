import React from "react";
import { render, screen } from '../../../shared/test/wrapper'
import { throwErr } from '../../../shared/test/utils'
import { DisplayGrid } from './DisplayGrid'
import { useFixedSizeItemOffsetMapping } from './useFixedSizeItemOffsetMapping';

// Special case logic all covered by DisplayList tests
describe('DisplayGrid', () => {
  const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
    <div className={ rowIndex == 0 ? "header" : "cell" } style={style}>
      { (rowIndex == 0) ? `Header ${columnIndex}` : `Cell ${rowIndex}:${columnIndex}` }
    </div>
  );
    
  const rowMapping = useFixedSizeItemOffsetMapping(30);
  const columnMapping = useFixedSizeItemOffsetMapping(100);
  
  it('should render at offset 0', () => {
    render(
      <DisplayGrid
        rowOffset={0}
        columnOffset={0}
        height={240}
        rowCount={100}
        columnCount={100}
        rowOffsetMapping={rowMapping}
        columnOffsetMapping={columnMapping}
        width={600}>
        {Cell}
      </DisplayGrid>
    )
    const header = screen.getByText('Header 0');
    expect(header).toBeInTheDocument()

    const innerDiv = header.parentElement || throwErr("No inner div");
    expect(innerDiv).toHaveProperty("style.top", '0px')
    expect(innerDiv).toHaveProperty("style.left", '0px')
    expect(innerDiv).toHaveProperty("style.grid-template-rows", 'repeat(8,30px)')
    expect(innerDiv).toHaveProperty("style.grid-template-columns", 'repeat(6,100px)')

    const item1 = screen.getByText('Cell 1:0');
    expect(item1).toBeInTheDocument()

    const item8 = screen.getByText('Cell 7:0');
    expect(item8).toBeInTheDocument()

    const item8a = screen.getByText('Cell 7:5');
    expect(item8a).toBeInTheDocument()

    expect(screen.queryByText('Cell 8:0')).toBeNull()
    expect(screen.queryByText('Cell 0:6')).toBeNull()
    expect(screen.queryByText('Cell 8:6')).toBeNull()
  })
})