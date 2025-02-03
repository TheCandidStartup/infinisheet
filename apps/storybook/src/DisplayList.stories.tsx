import React from "react";
import type { Meta, StoryObj } from '@storybook/react';

import { DisplayList, DisplayListProps } from '@candidstartup/react-virtual-scroll';
import { mappingVariableVertical, mappingFixedVertical, mappingFixedHorizontal, rewriteMapping } from './mapping';

const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
  <div className={ index == 0 ? "VirtualSpreadsheet_Row VirtualSpreadsheet_Row__Selected" : "VirtualSpreadsheet_Row" } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

const Column = ({ index, style }: { index: number, style: React.CSSProperties }) => (
  <div className={ index == 0 ? "VirtualSpreadsheet_Column VirtualSpreadsheet_Column__Selected" : "VirtualSpreadsheet_Column" } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

const meta: Meta<DisplayListProps> = {
  title: 'react-virtual-scroll/DisplayList',
  component: DisplayList,
  render: ( {layout, children: _children, itemOffsetMapping, ...args}) => (
    <DisplayList layout={layout} itemOffsetMapping={rewriteMapping(itemOffsetMapping, layout)}{...args}>
      {layout === 'horizontal' ? Column : Row}
    </DisplayList>
  ),
  argTypes: {
    itemOffsetMapping: {
      options: ['Fixed', 'Variable'],
      mapping: {
        Fixed: mappingFixedVertical,
        Variable: mappingVariableVertical
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    offset: 0,
    layout: 'vertical',
    itemCount: 100,
    itemOffsetMapping: mappingVariableVertical,
    width: 600,
    height: 240,
    children: Row,
  },
};

export const NegativeOffset: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    offset: -80,
    layout: 'vertical',
    itemCount: 100,
    itemOffsetMapping: mappingVariableVertical,
    width: 600,
    height: 240,
    children: Row,
  },
};

export const PositiveOffset: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    offset: 2820,
    layout: 'vertical',
    itemCount: 100,
    itemOffsetMapping: mappingVariableVertical,
    width: 600,
    height: 240,
    children: Row,
  },
};

export const Horizontal: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    offset: 0,
    layout: 'horizontal',
    children: Column,
    itemCount: 100,
    itemOffsetMapping: mappingFixedHorizontal,
    width: 600,
    height: 50,
  },
};