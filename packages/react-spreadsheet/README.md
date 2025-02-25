[![NPM Type Definitions](https://img.shields.io/npm/types/@candidstartup/react-spreadsheet)](https://www.npmjs.com/package/@candidstartup/react-spreadsheet)
[![NPM Version](https://img.shields.io/npm/v/@candidstartup/react-spreadsheet)](https://www.npmjs.com/package/@candidstartup/react-spreadsheet)
[![NPM bundle size](https://img.shields.io/bundlephobia/minzip/@candidstartup/react-spreadsheet)](https://www.npmjs.com/package/@candidstartup/react-spreadsheet)
[![Build Status](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml/badge.svg?event=push)](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml)

[GitHub](https://github.com/TheCandidStartup/infinisheet/tree/main/packages/react-spreadsheet) | [NPM](https://www.npmjs.com/package/@candidstartup/react-spreadsheet) | [Storybook](https://www.thecandidstartup.org/infinisheet/storybook/?path=/docs/react-spreadsheet--docs) | [API](https://www.thecandidstartup.org/infinisheet/modules/_candidstartup_react-spreadsheet.html) 

# @candidstartup/react-spreadsheet

React based spreadsheet frontend. Written in TypeScript using modern React. Scalable to trillions of rows and columns. 

## Interface

The package provides a combined `VirtualSpreadsheet` component that includes a spreadsheet grid, row and column headers and input bar. The component is virtualized with data retrieved on demand via a `SpreadsheetData` interface. The component supports data sources that change independently.

The package includes `VirtualSpreadsheet.css` which provides basic styling using the BEM convention. The stylesheet can be imported directly or as a CSS module for isolation. Use your own CSS if you prefer.

A [theming system](https://www.thecandidstartup.org/2024/08/26/css-react-components.html) allows you to map the component's local BEM style class names to whatever class names the consuming app would like to use. This allows you to use `VirtualSpreadsheet` with other CSS conventions, Atomic CSS, or CSS in JS. 

`VirtualSpreadsheet` can be combined with `AutoSizer` from [react-virtual-scroll](https://github.com/TheCandidStartup/infinisheet/tree/main/packages/react-virtual-scroll) to fill the available space.

## Implementation

`VirtualSpreadsheet` is built using components from the [react-virtual-scroll](https://github.com/TheCandidStartup/infinisheet/tree/main/packages/react-virtual-scroll) package. It uses [numfmt](https://github.com/borgar/numfmt) for ECMA-376 compatible number formatting.

## VirtualSpreadsheet Example

```tsx
import { VirtualSpreadsheet, VirtualSpreadsheetDefaultTheme as theme } from '@candidstartup/react-spreadsheet';
import '@candidstartup/react-spreadsheet/VirtualSpreadsheet.css';
import { BoringData } from './BoringData';

const data = new BoringData;

...

<VirtualSpreadsheet
  data={data}
  theme={theme}
  height={380}
  width={700}>
</VirtualSpreadsheet>
```

Check out the [full sample](https://github.com/TheCandidStartup/infinisheet/blob/main/apps/spreadsheet-sample/src/App.tsx) or [try it out on Storybook](https://www.thecandidstartup.org/infinisheet/storybook/?path=/story/react-spreadsheet-virtualspreadsheet--boring-data)

# More

Want to know more? Check out my [blog](https://www.thecandidstartup.org/topics/react-spreadsheet.html)


