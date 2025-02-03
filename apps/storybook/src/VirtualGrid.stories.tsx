import React from "react";
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { VirtualGrid, VirtualGridProps, useFixedSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';
import { mappingVariableVertical, mappingVariableHorizontal, mappingFixedVertical, mappingFixedHorizontal } from './mapping';

const mappingWideHorizontal = useFixedSizeItemOffsetMapping(160);

function cellClassName(rowIndex: number, isScrolling?: boolean): string {
  return rowIndex == 0 
    ? "VirtualSpreadsheet_Cell VirtualSpreadsheet_Cell__RowSelected" : 
    ( isScrolling ? "VirtualSpreadsheet_Cell VirtualSpreadsheet_Cell__Type_undefined" : "VirtualSpreadsheet_Cell" );
}

const Cell = ({ rowIndex, columnIndex, isScrolling, style }: { rowIndex: number, columnIndex: number, isScrolling?: boolean, style: React.CSSProperties }) => (
  <div className={cellClassName(rowIndex,isScrolling)} style={style}>
    { (rowIndex == 0) ? `${columnIndex}` : `${rowIndex}:${columnIndex}` }
  </div>
);

const meta: Meta<VirtualGridProps> = {
  title: 'react-virtual-scroll/VirtualGrid',
  component: VirtualGrid,
  render: ( {children: _children, ...args}) => (
    <VirtualGrid {...args}>
      {Cell}
    </VirtualGrid>
  ),
  argTypes: {
    rowOffsetMapping: {
      options: ['Fixed', 'Variable'],
      mapping: {
        Fixed: mappingFixedVertical,
        Variable: mappingVariableVertical
      }
    },
    columnOffsetMapping: {
      options: ['Fixed', 'Variable', 'Wide'],
      mapping: {
        Fixed: mappingFixedHorizontal,
        Variable: mappingVariableHorizontal,
        Wide: mappingWideHorizontal
      }
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onScroll: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HundredSquare: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    rowCount: 100,
    columnCount: 100,
    rowOffsetMapping: mappingVariableVertical,
    columnOffsetMapping: mappingFixedHorizontal,
    width: 600,
    height: 240
  },
};

export const TrillionSquare: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    rowCount: 1000000000,
    columnCount: 1000000000,
    rowOffsetMapping: mappingVariableVertical,
    columnOffsetMapping: mappingWideHorizontal,
    width: 600,
    height: 240
  },
};
