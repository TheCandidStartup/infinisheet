import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from '@storybook/test';

import { VirtualSpreadsheet, VirtualSpreadsheetProps, VirtualSpreadsheetDefaultTheme as theme } from '@candidstartup/react-spreadsheet';
import { AutoSizer } from '@candidstartup/react-virtual-scroll';

import { SimpleSpreadsheetData, LayeredSpreadsheetData, SimpleEventLog, DelayEventLog, SimpleBlobStore, 
  SimpleWorkerHost, SimpleWorker } from '@candidstartup/simple-spreadsheet-data';
import { EventSourcedSpreadsheetData, EventSourcedSpreadsheetWorkflow, SpreadsheetLogEntry } from '@candidstartup/event-sourced-spreadsheet-data';
import { BoringData as BoringDataType } from '../../spreadsheet-sample/src/BoringData';
import { TestData as TestDataType } from '../../spreadsheet-sample/src/TestData';
import { CellRefData } from '../../spreadsheet-sample/src/CellRefData';
import { emptyViewport, PendingWorkflowMessage } from '@candidstartup/infinisheet-types';

const emptySpreadsheet = new SimpleSpreadsheetData;
const boringData = new LayeredSpreadsheetData(new BoringDataType, new SimpleSpreadsheetData);
const testData = new LayeredSpreadsheetData(new TestDataType, new SimpleSpreadsheetData);
const cellNameData = new LayeredSpreadsheetData(new CellRefData, new SimpleSpreadsheetData);
const blobStore = new SimpleBlobStore;
const worker = new SimpleWorker<PendingWorkflowMessage>;
const workerHost = new SimpleWorkerHost(worker);
const eventLog = new SimpleEventLog<SpreadsheetLogEntry>(workerHost);
new EventSourcedSpreadsheetWorkflow(eventLog, blobStore, worker);
const delayEventLogA = new DelayEventLog(eventLog);
const delayEventLogB = new DelayEventLog(eventLog);

// Start with empty viewport so we only load data that's visible
const viewport = emptyViewport(); 
const eventSourcedDataA = new EventSourcedSpreadsheetData(delayEventLogA, blobStore, undefined, { viewport });
const eventSourcedDataB = new EventSourcedSpreadsheetData(delayEventLogB, blobStore, undefined, { viewport });

type VirtualSpreadsheetPropsAndCustomArgs = VirtualSpreadsheetProps & { 
  eventSourceLatencyA?: number | undefined,
  eventSourceLatencyB?: number | undefined
};

const meta: Meta<VirtualSpreadsheetPropsAndCustomArgs> = {
  title: 'react-spreadsheet/VirtualSpreadsheet',
  component: VirtualSpreadsheet,
  parameters: {
    docs: {
      story: {
        // Not safe to automatically run play functions for stories included in "Docs" page.
        // * If focus given to input, Docs page gets scrolled to story rather than the top
        // * Stories are rendered concurrently which means generated keyboard input can go to wrong place
        // * Stories rendered concurrently can confuse the dev version of React
        //   into triggering its "you haven't wrapped state updates in tests with act() warning".
        // Most stories with play functions are pointless without playing them so in most cases they're also
        // removed from the Docs page entirely using tags: ['!autodocs']
        autoplay: false
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
        "Cell Names": cellNameData
      }
    },
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
  tags: ['!autodocs'],
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
  tags: ['!autodocs'],
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
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByText("1899-12-22");
    await userEvent.click(row);
    const name = canvas.getByTitle("Name");
    await expect(name).toHaveProperty('value', "C3");
  }
};

export const DataError: Story = {
  args: {
    theme: theme,
    data: boringData,
    width: 700,
    height: 380,
  },
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByTitle("Name");
    await userEvent.type(name, "A2");
    await userEvent.keyboard("{Enter}{Enter}9");

    const tag = canvas.getByText("Expected a date or time");
    await expect(tag).toBeInTheDocument();
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

export const EventSourceSync: Story = {
  args: {
    theme: theme,
    width: 700,
    height: 380,
  },
  argTypes:{
    data: {
      table: {
        disable: true
      },
    },
    eventSourceLatencyA: {
      description: "Latency (ms) when accessing data source for top spreadsheet",
      table: {
        category: "Network Simulation",
        disable: false,
      },
      control: {
        type: 'number'
      }
    },
    eventSourceLatencyB: {
      description: "Latency (ms) when accessing data source for bottom spreadsheet",
      table: {
        category: "Network Simulation",
        disable: false,
      },
      control: {
        type: 'number'
      }
    },
  },
  tags: ['!autodocs'],
  render: ( {width: width, height: height, eventSourceLatencyA, eventSourceLatencyB, data: _data, ...args} ) => {
    delayEventLogA.delay = eventSourceLatencyA || 0;
    delayEventLogB.delay = eventSourceLatencyB || 0;
    return <div>
      <VirtualSpreadsheet width={width} height={height} data={eventSourcedDataA} {...args}/>
      <div style={{ marginTop: 10, marginBottom: 10 }}>
        Shared Event Log, ↑ {delayEventLogA.delay} ms latency,  ↓ {delayEventLogB.delay} ms latency, Sync every 10 seconds
      </div>
      <VirtualSpreadsheet width={width} height={height} data={eventSourcedDataB} {...args}/>
    </div>
  },
};