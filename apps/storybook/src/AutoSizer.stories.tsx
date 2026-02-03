import type { Meta, StoryObj } from '@storybook/react-vite';

import { AutoSizer, AutoSizerProps } from '@candidstartup/react-virtual-scroll';

// Auto-generated code (based on rendered JSX) can't show how child render function is used
const displayCode = `
<AutoSizer style={{ width: '100%', height: '100%', minWidth: 100, minHeight: 100 }}>
  {({width, height}) => (
    <div style={{ width: width, height: height }}>
      width: {width} <br/>
      height: {height} <br/>
    </div>
  )}
</AutoSizer>`

const meta: Meta<AutoSizerProps> = {
  title: 'react-virtual-scroll/AutoSizer',
  component: AutoSizer,
  decorators: [
    // Needed to that AutoSizer can use full height
    (Story) => (
      <div style={{ height: '100vh' }}>
        <Story/>
      </div>
    )
  ],
  render: ( {...args} ) => (
      <AutoSizer style={{ width: '100%', height: '100%', minWidth: 100, minHeight: 100 }} {...args}>
        {({width, height}) => (
          <div className={"VirtualSpreadsheet_CornerHeader"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: width, height: height }}>
            width: {width} <br/>
            height: {height} <br/>
          </div>
        )}
      </AutoSizer>
  ),
  parameters: {
    // Needed so that AutoSizer can use full width
    layout: 'fullscreen',
    docs: {
      source: {
        type: 'code',
        code: displayCode
      }
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FullScreen: Story = {
  args: {
  },
};
