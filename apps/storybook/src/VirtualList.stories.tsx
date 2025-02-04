import React from "react";
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { VirtualList, VirtualListProps } from '@candidstartup/react-virtual-scroll';
import { mappingVariableVertical, mappingFixedVertical, mappingFixedHorizontal, rewriteMapping } from './mapping';

function rowClassName(rowIndex: number, isScrolling?: boolean): string {
  return rowIndex == 0 
    ? "VirtualSpreadsheet_Row VirtualSpreadsheet_Row__Selected VirtualSpreadsheet_Cell__Type_boolean" : 
    ( isScrolling ? "VirtualSpreadsheet_Row VirtualSpreadsheet_Cell__Type_undefined" : "VirtualSpreadsheet_Row VirtualSpreadsheet_Cell__Type_boolean" );
}

const Row = ({ index, style, isScrolling }: { index: number, isScrolling?: boolean, style: React.CSSProperties }) => (
  <div className={ rowClassName(index, isScrolling) } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function colClassName(index: number, isScrolling?: boolean): string {
  return index == 0 
    ? "VirtualSpreadsheet_Column VirtualSpreadsheet_Column__Selected VirtualSpreadsheet_Cell__Type_boolean" : 
    ( isScrolling ? "VirtualSpreadsheet_Column VirtualSpreadsheet_Cell__Type_undefined" : "VirtualSpreadsheet_Column VirtualSpreadsheet_Cell__Type_boolean" );
}

const Column = ({ index, style, isScrolling }: { index: number, isScrolling?: boolean, style: React.CSSProperties }) => (
  <div className={ colClassName(index, isScrolling) } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

const meta: Meta<VirtualListProps> = {
  title: 'react-virtual-scroll/VirtualList',
  component: VirtualList,
  render: ( {layout, children: _children, itemOffsetMapping, ...args}) => (
    <VirtualList layout={layout} itemOffsetMapping={rewriteMapping(itemOffsetMapping, layout)}{...args}>
      {layout === 'horizontal' ? Column : Row}
    </VirtualList>
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
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onScroll: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

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

export const UseIsScrolling: Story = {
  args: {
    useIsScrolling: true,
    className: 'VirtualSpreadsheet_CornerHeader',
    children: Row,
    itemCount: 100,
    itemOffsetMapping: mappingVariableVertical,
    width: 600,
    height: 240,
  },
};