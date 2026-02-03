import type { Preview } from "@storybook/react-vite";
import '@candidstartup/react-spreadsheet/VirtualSpreadsheet.css';
import { extractArgTypes, extractComponentDescription } from '../src/extract';
import theme from './theme';

const preview: Preview = {
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],

  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',

    docs: {
      extractComponentDescription,
      extractArgTypes,
      theme: theme,
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
