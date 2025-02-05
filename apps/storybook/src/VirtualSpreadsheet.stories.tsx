import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';

import { VirtualSpreadsheet, VirtualSpreadsheetProps, VirtualSpreadsheetDefaultTheme as theme } from '@candidstartup/react-spreadsheet';
import { EmptySpreadsheetData } from '@candidstartup/react-spreadsheet';
import { BoringData as BoringDataType } from '../../spreadsheet-sample/src/BoringData';
import { TestData as TestDataType } from '../../spreadsheet-sample/src/TestData';
import { CellRefData } from '../../spreadsheet-sample/src/CellRefData';

const emptySpreadsheet = new EmptySpreadsheetData;
const boringData = new BoringDataType;
const testData = new TestDataType;
const cellNameData = new CellRefData;

const meta: Meta<VirtualSpreadsheetProps<number>> = {
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
    width: 600,
    height: 300,
  },
};

export const BoringData: Story = {
  args: {
    theme: theme,
    data: boringData,
    width: 600,
    height: 300,
  },
};

export const TestData: Story = {
  args: {
    theme: theme,
    data: testData,
    width: 600,
    height: 300,
  },
};

export const CellNamesData: Story = {
  args: {
    theme: theme,
    data: cellNameData,
    width: 600,
    height: 300,
  },
};

export const RowSelected: Story = {
  args: {
    theme: theme,
    data: testData,
    width: 600,
    height: 300,
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
    width: 600,
    height: 300,
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
    width: 600,
    height: 300,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByText("1899-12-22");
    await userEvent.click(row);
    const name = canvas.getByTitle("Name");
    await expect(name).toHaveProperty('value', "C3");
  }
};