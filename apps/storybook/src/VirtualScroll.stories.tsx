import React from "react";
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { VirtualScroll, VirtualScrollProps, VirtualScrollProxy } from '@candidstartup/react-virtual-scroll';

// Auto-generated code (based on rendered JSX) can't show how child render function is used
const displayCode = `
<VirtualScroll {...args}>
  {({ isScrolling, verticalOffset, horizontalOffset }) => (
    <div>
      isScrolling: {isScrolling ? 'true' : 'false'} <br/>
      verticalOffset: {verticalOffset} <br/>
      horizontalOffset: {horizontalOffset} <br/>
    </div>
  )}
</VirtualScroll>`

type VirtualScrollPropsAndCustomArgs = VirtualScrollProps & { 
  scrollToVerticalOffset?: number,
  scrollToHorizontalOffset?: number
};

const meta: Meta<VirtualScrollPropsAndCustomArgs> = {
  title: 'react-virtual-scroll/VirtualScroll',
  component: VirtualScroll,
  render: ( {scrollToVerticalOffset, scrollToHorizontalOffset, ...args} ) => {
    const proxy = React.useRef<VirtualScrollProxy>(null);

    React.useEffect(() => { 
      if (scrollToVerticalOffset !== undefined) {
        proxy.current?.scrollTo(scrollToVerticalOffset, undefined);
      }
    }, [scrollToVerticalOffset])

    React.useEffect(() => { 
      if (scrollToHorizontalOffset !== undefined) {
        proxy.current?.scrollTo(undefined, scrollToHorizontalOffset);
      }
    }, [scrollToHorizontalOffset])

    return <VirtualScroll ref={proxy} {...args}>
      {({ isScrolling, verticalOffset, horizontalOffset }) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          isScrolling: {isScrolling ? 'true' : 'false'} <br/>
          verticalOffset: {verticalOffset} <br/>
          horizontalOffset: {horizontalOffset} <br/>
        </div>
      )}
    </VirtualScroll>
  },

  argTypes: {
    scrollToVerticalOffset: {
      description: "Scrolls to vertical offset (in pixels) using `VirtualScrollProxy.scrollTo`",
      table: {
        category: "Interactive",
      },
      control: {
        type: 'number'
      }
    },
    scrollToHorizontalOffset: {
      description: "Scrolls to horizontal offset (in pixels) using `VirtualScrollProxy.scrollTo`",
      table: {
        category: "Interactive",
      },
      control: {
        type: 'number'
      }
    },
  },
  args: { onScroll: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoDimensions: Story = {
  parameters: {
    docs: {
      source: {
        type: 'code',
        code: displayCode
      }
    }
  },
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    scrollHeight: 10000,
    scrollWidth: 10000,
    useIsScrolling: true,
    width: 600,
    height: 200
  },
};

export const Vertical: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    scrollHeight: 10000,
    useIsScrolling: true,
    width: 200,
    height: 300
  },
};

export const Horizontal: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    scrollWidth: 10000,
    useIsScrolling: true,
    width: 600,
    height: 200
  },
};