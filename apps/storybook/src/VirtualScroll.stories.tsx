import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { VirtualScroll, VirtualScrollProps } from '@candidstartup/react-virtual-scroll';

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

const meta: Meta<VirtualScrollProps> = {
  title: 'react-virtual-scroll/VirtualScroll',
  component: VirtualScroll,
  render: ( {...args} ) => (
    <VirtualScroll {...args}>
      {({ isScrolling, verticalOffset, horizontalOffset }) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          isScrolling: {isScrolling ? 'true' : 'false'} <br/>
          verticalOffset: {verticalOffset} <br/>
          horizontalOffset: {horizontalOffset} <br/>
        </div>
      )}
    </VirtualScroll>
  ),

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
    width: 600,
    height: 200
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