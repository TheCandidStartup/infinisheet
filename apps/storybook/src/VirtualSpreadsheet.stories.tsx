import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';

import { VirtualSpreadsheet, VirtualSpreadsheetProps, VirtualSpreadsheetDefaultTheme as theme } from '@candidstartup/react-spreadsheet';
import { AutoSizer } from '@candidstartup/react-virtual-scroll';

import { SimpleSpreadsheetData, LayeredSpreadsheetData } from '@candidstartup/simple-spreadsheet-data';
import { BoringData as BoringDataType } from '../../spreadsheet-sample/src/BoringData';
import { TestData as TestDataType } from '../../spreadsheet-sample/src/TestData';
import { CellRefData } from '../../spreadsheet-sample/src/CellRefData';

const emptySpreadsheet = new SimpleSpreadsheetData;
const boringData = new LayeredSpreadsheetData(new BoringDataType, new SimpleSpreadsheetData);
const testData = new LayeredSpreadsheetData(new TestDataType, new SimpleSpreadsheetData);
const cellNameData = new LayeredSpreadsheetData(new CellRefData, new SimpleSpreadsheetData);

const meta: Meta<VirtualSpreadsheetProps> = {
  title: 'react-spreadsheet/VirtualSpreadsheet',
  component: VirtualSpreadsheet,
  parameters: {
    docs: {
      story: {
        autoplay: true
      }
    }
  },
  argTypes: {
    theme: {
      options: ['Default'],
      mapping: {
        Default: theme
      }
    },
    data: {
      options: ['Empty', 'Test', 'Boring', 'Cell Names'],
      mapping: {
        Empty: emptySpreadsheet,
        Test: testData,
        Boring: boringData,
        "Cell Names": cellNameData,
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    theme: theme,
    data: emptySpreadsheet,
    width: 700,
    height: 380,
  },
};

export const BoringData: Story = {
  args: {
    theme: theme,
    data: boringData,
    width: 700,
    height: 380,
  },
};

export const TestData: Story = {
  args: {
    theme: theme,
    data: testData,
    width: 700,
    height: 380,
  },
};

export const CellNamesData: Story = {
  args: {
    theme: theme,
    data: cellNameData,
    width: 700,
    height: 380,
  },
};

export const ReadOnly: Story = {
  args: {
    theme: theme,
    data: testData,
    width: 700,
    height: 380,
    readOnly: true
  },
};

export const RowSelected: Story = {
  args: {
    theme: theme,
    data: testData,
    width: 700,
    height: 380,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByText("3");
    await userEvent.click(row);
    const name = canvas.getByTitle("Name");
    await expect(name).toHaveProperty('value', "3");
  }
};

export const ColumnSelected: Story = {
  args: {
    theme: theme,
    data: testData,
    width: 700,
    height: 380,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByText("C");
    await userEvent.click(row);
    const name = canvas.getByTitle("Name");
    await expect(name).toHaveProperty('value', "C");
  }
};

export const CellSelected: Story = {
  args: {
    theme: theme,
    data: testData,
    width: 700,
    height: 380,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByText("1899-12-22");
    await userEvent.click(row);
    const name = canvas.getByTitle("Name");
    await expect(name).toHaveProperty('value', "C3");
  }
};

// Auto-generated code (based on rendered JSX) can't show how child render function is used
const fullWidthCode = `
<AutoSizer style={{ width: '100%', height }}>
  {({width}) => (
    <VirtualSpreadsheet width={width} height={height} {...rest} }/>
  )}
</AutoSizer>`

export const FullWidth: Story = {
  args: {
    theme: theme,
    data: testData,
    width: 0,
    height: 500,
  },
  argTypes:{
    width: {
      table: {
        disable: true
      },
    },
  },
  render: ( {width: _width, height, ...args} ) => (
    <AutoSizer style={{ width: '100%', height }}>
      {({width}) => (
        <VirtualSpreadsheet width={width} height={height} {...args}/>
      )}
    </AutoSizer>
  ),
  parameters: {
    // Needed so that AutoSizer can use full width
    layout: 'fullscreen',
    docs: {
      source: {
        type: 'code',
        code: fullWidthCode
      }
    }
  },
};

// Auto-generated code (based on rendered JSX) can't show how child render function is used
const fullScreenCode = `
<AutoSizer style={{ width: '100%', height: '100%' }}>
  {({width, height}) => (
    <VirtualSpreadsheet width={width} height={height} {...rest} }/>
  )}
</AutoSizer>`

export const FullScreen: Story = {
  args: {
    theme: theme,
    data: testData,
    width: 0,
    height: 0,
  },
  argTypes:{
    width: {
      table: {
        disable: true
      },
    },
    height: {
      table: {
        disable: true
      },
    }
  },
  render: ( {width: _width, height: _height, ...args} ) => (
    <AutoSizer style={{ width: '100%', height: '100vh' }}>
      {({width, height}) => (
        <VirtualSpreadsheet width={width} height={height} {...args}/>
      )}
    </AutoSizer>
  ),
  parameters: {
    // Needed so that AutoSizer can use full width
    layout: 'fullscreen',
    docs: {
      source: {
        type: 'code',
        code: fullScreenCode
      }
    }
  },
};

