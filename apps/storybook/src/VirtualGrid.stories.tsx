import React from "react";
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useArgs } from 'storybook/preview-api';

import { ScrollState, VirtualGrid, VirtualGridProps, VirtualGridProxy, 
  useFixedSizeItemOffsetMapping, DisplayGridItemProps } from '@candidstartup/react-virtual-scroll';
import { mappingVariableVertical, mappingVariableHorizontal, mappingFixedVertical, mappingFixedHorizontal } from './mapping';

const mappingWideHorizontal = useFixedSizeItemOffsetMapping(160);

function cellClassName(rowIndex: number, isScrolling?: boolean): string {
  return rowIndex == 0 
    ? "VirtualSpreadsheet_Row VirtualSpreadsheet_Row__Selected VirtualSpreadsheet_Cell__Type_boolean" : 
    ( isScrolling ? "VirtualSpreadsheet_Cell VirtualSpreadsheet_Cell__Type_undefined" : "VirtualSpreadsheet_Cell VirtualSpreadsheet_Cell__Type_boolean" );
}

const Cell = ({ rowIndex, columnIndex, isScrolling, style }: DisplayGridItemProps) => (
  <div className={cellClassName(rowIndex,isScrolling)} style={style}>
    { (rowIndex == 0) ? `${columnIndex}` : `${rowIndex}:${columnIndex}` }
  </div>
);

type VirtualGridPropsAndCustomArgs = VirtualGridProps & { 
  currentRowOffset?: number | undefined,
  currentColumnOffset?: number | undefined,
  currentRow?: number | undefined,
  currentColumn?: number | undefined,
  scrollToRowOffset?: number | undefined,
  scrollToColumnOffset?: number | undefined,
  scrollToRow?: number | undefined,
  scrollToColumn?: number | undefined
};

const meta: Meta<VirtualGridPropsAndCustomArgs> = {
  title: 'react-virtual-scroll/VirtualGrid',
  component: VirtualGrid,
  render: ( { children: _children, rowOffsetMapping, columnOffsetMapping, onScroll,
              currentRow, currentColumn, scrollToRow, scrollToColumn, 
              currentRowOffset, currentColumnOffset, scrollToRowOffset, scrollToColumnOffset, 
              ...args}) => {
    const [_, updateArgs] = useArgs();
    const gridProxy = React.useRef<VirtualGridProxy>(null);

    React.useEffect(() => { 
      if (scrollToRow !== undefined) {
        gridProxy.current?.scrollToItem(scrollToRow, undefined);
      }
    }, [scrollToRow])

    React.useEffect(() => { 
      if (scrollToColumn !== undefined) {
        gridProxy.current?.scrollToItem(undefined, scrollToColumn);
      }
    }, [scrollToColumn])

    React.useEffect(() => { 
      if (scrollToRowOffset !== undefined) {
        gridProxy.current?.scrollTo(scrollToRowOffset, undefined)
      }
    }, [scrollToRowOffset])

    React.useEffect(() => { 
      if (scrollToColumnOffset !== undefined) {
        gridProxy.current?.scrollTo(undefined, scrollToColumnOffset)
      }
    }, [scrollToColumnOffset])

    function ScrollHandler(rowOffset: number, columnOffset: number, newRowScrollState: ScrollState, newColumnScrollState: ScrollState): void {
      // Record event for actions tab
      if (onScroll)
        onScroll(rowOffset, columnOffset, newRowScrollState, newColumnScrollState);
    
      if (rowOffset != currentRowOffset)
        updateArgs({ currentRowOffset: rowOffset });

      if (columnOffset != currentColumnOffset)
        updateArgs({ currentColumnOffset: columnOffset });

      const [row] = rowOffsetMapping.offsetToItem(rowOffset);
      if (row != currentRow)
        updateArgs({ currentRow: row });

      const [column] = columnOffsetMapping.offsetToItem(columnOffset);
      if (column != currentColumn)
        updateArgs({ currentColumn: column });
    }

    return <VirtualGrid ref={gridProxy} onScroll={ScrollHandler} 
        rowOffsetMapping={rowOffsetMapping} columnOffsetMapping={columnOffsetMapping}
        {...args}>
      {Cell}
    </VirtualGrid>
  },
  argTypes: {
    currentRow: {
      description: "Displays current row reported via `OnScroll` and `ItemOffsetMapping`",
      table: {
        category: "Interactive",
        readonly: true
      }
    },
    currentColumn: {
      description: "Displays current column reported via `OnScroll` and `ItemOffsetMapping`",
      table: {
        category: "Interactive",
        readonly: true
      }
    },
    scrollToRow: {
      description: "Scrolls to row using `VirtualGridProxy.scrollToItem`",
      table: {
        category: "Interactive",
      },
      control: {
        type: 'number'
      }
    },
    scrollToColumn: {
      description: "Scrolls to column using `VirtualGridProxy.scrollToItem`",
      table: {
        category: "Interactive",
      },
      control: {
        type: 'number'
      }
    },
    currentRowOffset: {
      description: "Displays current row offset (in pixels) reported via `OnScroll`",
      table: {
        category: "Interactive",
        readonly: true
      }
    },
    currentColumnOffset: {
      description: "Displays current column offset (in pixels) reported via `OnScroll`",
      table: {
        category: "Interactive",
        readonly: true
      }
    },
    scrollToRowOffset: {
      description: "Scrolls to row offset (in pixels) using `VirtualGridProxy.scrollTo`",
      table: {
        category: "Interactive",
      },
      control: {
        type: 'number'
      }
    },
    scrollToColumnOffset: {
      description: "Scrolls to column offset (in pixels) using `VirtualGridProxy.scrollTo`",
      table: {
        category: "Interactive",
      },
      control: {
        type: 'number'
      }
    },
    rowOffsetMapping: {
      options: ['Fixed', 'Variable'],
      mapping: {
        Fixed: mappingFixedVertical,
        Variable: mappingVariableVertical
      }
    },
    columnOffsetMapping: {
      options: ['Fixed', 'Variable', 'Wide'],
      mapping: {
        Fixed: mappingFixedHorizontal,
        Variable: mappingVariableHorizontal,
        Wide: mappingWideHorizontal
      }
    },
  },
  args: { 
    onScroll: fn(),
    currentRow: 0,
    currentColumn: 0,
    currentColumnOffset: 0,
    currentRowOffset: 0
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const HundredSquare: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    rowCount: 100,
    columnCount: 100,
    rowOffsetMapping: mappingVariableVertical,
    columnOffsetMapping: mappingFixedHorizontal,
    width: 600,
    height: 240
  },
};

export const TrillionSquare: Story = {
  args: {
    className: 'VirtualSpreadsheet_CornerHeader',
    rowCount: 1000000000,
    columnCount: 1000000000,
    rowOffsetMapping: mappingVariableVertical,
    columnOffsetMapping: mappingWideHorizontal,
    width: 600,
    height: 240
  },
};

export const UseIsScrolling: Story = {
  args: {
    useIsScrolling: true,
    className: 'VirtualSpreadsheet_CornerHeader',
    rowCount: 100,
    columnCount: 100,
    rowOffsetMapping: mappingVariableVertical,
    columnOffsetMapping: mappingFixedHorizontal,
    width: 600,
    height: 240
  },
};