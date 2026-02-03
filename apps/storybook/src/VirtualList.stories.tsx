import React from "react";
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useArgs } from 'storybook/preview-api';

import { ScrollState, VirtualList, VirtualListProps, VirtualListProxy, DisplayListItemProps } from '@candidstartup/react-virtual-scroll';
import { mappingVariableVertical, mappingFixedVertical, mappingFixedHorizontal, rewriteMapping } from './mapping';

function rowClassName(rowIndex: number, isScrolling?: boolean): string {
  return rowIndex == 0 
    ? "VirtualSpreadsheet_Row VirtualSpreadsheet_Row__Selected VirtualSpreadsheet_Cell__Type_boolean" : 
    ( isScrolling ? "VirtualSpreadsheet_Row VirtualSpreadsheet_Cell__Type_undefined" : "VirtualSpreadsheet_Row VirtualSpreadsheet_Cell__Type_boolean" );
}

const Row = ({ index, style, isScrolling }: DisplayListItemProps) => (
  <div className={ rowClassName(index, isScrolling) } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

function colClassName(index: number, isScrolling?: boolean): string {
  return index == 0 
    ? "VirtualSpreadsheet_Column VirtualSpreadsheet_Column__Selected VirtualSpreadsheet_Cell__Type_boolean" : 
    ( isScrolling ? "VirtualSpreadsheet_Column VirtualSpreadsheet_Cell__Type_undefined" : "VirtualSpreadsheet_Column VirtualSpreadsheet_Cell__Type_boolean" );
}

const Column = ({ index, style, isScrolling }: DisplayListItemProps) => (
  <div className={ colClassName(index, isScrolling) } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

type VirtualListPropsAndCustomArgs = VirtualListProps & { 
  currentOffset?: number | undefined,
  currentItem?: number | undefined,
  scrollToOffset?: number | undefined,
  scrollToItem?: number | undefined
};

const meta: Meta<VirtualListPropsAndCustomArgs> = {
  title: 'react-virtual-scroll/VirtualList',
  component: VirtualList,
  render: ( {layout, children: _children, currentItem, currentOffset, scrollToItem, scrollToOffset, onScroll, itemOffsetMapping, ...args}) => {
    const [_, updateArgs] = useArgs();
    const listProxy = React.useRef<VirtualListProxy>(null);

    React.useEffect(() => { 
      if (scrollToItem !== undefined) {
        listProxy.current?.scrollToItem(scrollToItem)
      }
    }, [scrollToItem])

    React.useEffect(() => { 
      if (scrollToOffset !== undefined) {
        listProxy.current?.scrollTo(scrollToOffset)
      }
    }, [scrollToOffset])

    const currentMapping = rewriteMapping(itemOffsetMapping, layout);

    function ScrollHandler(offset: number, newScrollState: ScrollState): void {
      // Record event for actions tab
      if (onScroll)
        onScroll(offset, newScrollState);
    
      if (offset != currentOffset)
        updateArgs({ currentOffset: offset });

      const [item] = currentMapping.offsetToItem(offset);
      if (item != currentItem)
        updateArgs({ currentItem: item });
    }

    return <VirtualList ref={listProxy} layout={layout} itemOffsetMapping={currentMapping} onScroll={ScrollHandler} {...args}>
      {layout === 'horizontal' ? Column : Row}
    </VirtualList>
  },
  argTypes: {
    currentItem: {
      description: "Displays current item reported via `OnScroll` and `ItemOffsetMapping`",
      table: {
        category: "Interactive",
        readonly: true
      }
    },
    scrollToItem: {
      description: "Scrolls to item using `VirtualListProxy.scrollToItem`",
      table: {
        category: "Interactive",
      },
      control: {
        type: 'number'
      }
    },
    currentOffset: {
      description: "Displays current offset (in pixels) reported via `OnScroll`",
      table: {
        category: "Interactive",
        readonly: true
      }
    },
    scrollToOffset: {
      description: "Scrolls to offset (in pixels) using `VirtualListProxy.scrollTo`",
      table: {
        category: "Interactive",
      },
      control: {
        type: 'number'
      }
    },
    itemOffsetMapping: {
      options: ['Fixed', 'Variable'],
      mapping: {
        Fixed: mappingFixedVertical,
        Variable: mappingVariableVertical
      }
    }
  },

  args: { 
    // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    onScroll: fn(),
    currentItem: 0,
    currentOffset: 0
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    children: Row,
    itemCount: 100,
    itemOffsetMapping: mappingVariableVertical,
    width: 150,
    height: 300,
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