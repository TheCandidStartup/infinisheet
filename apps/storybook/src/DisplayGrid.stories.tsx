import React from "react";
import type { Meta, StoryObj } from '@storybook/react';
import { DisplayGrid, DisplayGridProps } from '@candidstartup/react-virtual-scroll';
import { mappingVariableVertical, mappingFixedVertical, mappingVariableHorizontal, mappingFixedHorizontal } from './mapping';

  const Cell = ({ rowIndex, columnIndex, style }: { rowIndex: number, columnIndex: number, style: React.CSSProperties }) => (
    <div className={ rowIndex == 0 ? "VirtualSpreadsheet_Cell VirtualSpreadsheet_Cell__RowSelected" : "VirtualSpreadsheet_Cell" } style={style}>
      { (rowIndex == 0) ? `${columnIndex}` : `${rowIndex}:${columnIndex}` }
    </div>
  );

const meta: Meta<DisplayGridProps> = {
  title: 'react-virtual-scroll/DisplayGrid',
  component: DisplayGrid,
  render: ( { children: _children, ...args }) => (
    <DisplayGrid {...args}>
      {Cell}
    </DisplayGrid>
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
      options: ['Fixed', 'Variable'],
      mapping: {
        Fixed: mappingFixedHorizontal,
        Variable: mappingVariableHorizontal
      }
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Origin: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    rowOffset: 0,
    columnOffset: 0,
    rowCount: 100,
    columnCount: 100,
    rowOffsetMapping: mappingVariableVertical,
    columnOffsetMapping: mappingFixedHorizontal,
    width: 600,
    height: 240
  },
};

export const NegativeOffsets: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    rowOffset: -70,
    columnOffset: -90,
    rowCount: 100,
    columnCount: 100,
    rowOffsetMapping: mappingVariableVertical,
    columnOffsetMapping: mappingFixedHorizontal,
    width: 600,
    height: 240
  },
};

export const PositiveOffsets: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    rowOffset: 2820,
    columnOffset: 130,
    rowCount: 100,
    columnCount: 100,
    rowOffsetMapping: mappingVariableVertical,
    columnOffsetMapping: mappingFixedHorizontal,
    width: 600,
    height: 240
  },
};