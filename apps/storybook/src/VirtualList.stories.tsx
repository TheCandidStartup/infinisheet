import React from "react";
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { VirtualList, useVariableSizeItemOffsetMapping, useFixedSizeItemOffsetMapping, ItemOffsetMapping, ScrollLayout, VirtualListProps } from '@candidstartup/react-virtual-scroll';

const mappingVariableVertical = useVariableSizeItemOffsetMapping(30, [50]);
const mappingFixedVertical = useFixedSizeItemOffsetMapping(30);
const mappingVariableHorizontal = useVariableSizeItemOffsetMapping(100, [150]);
const mappingFixedHorizontal = useFixedSizeItemOffsetMapping(100);

function rewriteMapping(mapping: ItemOffsetMapping, layout?: ScrollLayout): ItemOffsetMapping {
  if (layout === 'horizontal') {
    switch (mapping) {
      case mappingVariableVertical: return mappingVariableHorizontal;
      case mappingFixedVertical: return mappingFixedHorizontal;
    }
    return mapping;
  } else {
    switch (mapping) {
      case mappingVariableHorizontal: return mappingVariableVertical;
      case mappingFixedHorizontal: return mappingFixedVertical;
    }
  }

  return mapping;
}

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

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<VirtualListProps> = {
  title: 'react-virtual-scroll/VirtualList',
  component: VirtualList,
  render: ( {layout, children: _children, itemOffsetMapping, ...args}) => (
    <VirtualList layout={layout} itemOffsetMapping={rewriteMapping(itemOffsetMapping, layout)}{...args}>
      {layout === 'horizontal' ? Column : Row}
    </VirtualList>
  ),
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered'
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    itemOffsetMapping: {
      options: ['Fixed', 'Variable'],
      mapping: {
        Fixed: mappingFixedVertical,
        Variable: mappingVariableVertical
      }
    }
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onScroll: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Vertical: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    children: Row,
    itemCount: 100,
    itemOffsetMapping: mappingVariableVertical,
    width: 600,
    height: 240,
  },
};

export const Horizontal: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    layout: 'horizontal',
    children: Column,
    itemCount: 100,
    itemOffsetMapping: mappingFixedHorizontal,
    width: 600,
    height: 50,
  },
};

export const TrillionRows: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    children: Row,
    itemCount: 1000000000,
    itemOffsetMapping: mappingVariableVertical,
    width: 600,
    height: 240,
  },
};