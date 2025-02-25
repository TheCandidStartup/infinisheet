[![NPM Type Definitions](https://img.shields.io/npm/types/@candidstartup/react-virtual-scroll)](https://www.npmjs.com/package/@candidstartup/react-virtual-scroll)
[![NPM Version](https://img.shields.io/npm/v/@candidstartup/react-virtual-scroll)](https://www.npmjs.com/package/@candidstartup/react-virtual-scroll)
[![NPM bundle size](https://img.shields.io/bundlephobia/minzip/@candidstartup/react-virtual-scroll)](https://www.npmjs.com/package/@candidstartup/react-virtual-scroll)
[![Build Status](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml/badge.svg?event=push)](https://github.com/TheCandidStartup/infinisheet/actions/workflows/build.yml)

[GitHub](https://github.com/TheCandidStartup/infinisheet/tree/main/packages/react-virtual-scroll) | [NPM](https://www.npmjs.com/package/@candidstartup/react-virtual-scroll) | [Storybook](https://www.thecandidstartup.org/infinisheet/storybook/?path=/docs/react-virtual-scroll--docs) | [API](https://www.thecandidstartup.org/infinisheet/modules/_candidstartup_react-virtual-scroll.html) 

# @candidstartup/react-virtual-scroll

React virtual scrolling components for lists and grids inspired by [react-window](https://github.com/bvaughn/react-window). Written in TypeScript using modern React. Scalable to trillions of rows and columns. 

## Interface

The interface is similar to `react-window` with three main changes. First, the components are functional rather than class based. 

Second, rather than having fixed and variable size variants of each component, the components are passed an `ItemOffsetMapping` object as a prop. This is an interface that the components query to determine the size and position of each item. The interface is [designed](https://www.thecandidstartup.org/2024/02/12/modern-react-virtual-scroll-grid-3.html) to ensure that the components have no scaling issues even with trillions of rows or columns. The package includes basic fixed and variable size item mappings. 

Finally, customization options have been reworked and extended. Basic customization is provided by render props rather than component props. The virtual scrolling list and grid components are composed from simpler components rather than being self contained. Consumers can put together their own combination of basic components rather than being limited to the pre-composed high level components.

## Implementation

Most of the scrolling logic is implemented by custom hooks that are packaged up as the `VirtualScroll` basic component. The logic that manages scrolling in a single dimension is implemented in `useVirtualScroll`. It's based on an [improved version](https://www.thecandidstartup.org/2024/04/29/modern-react-virtual-scroll-grid-9.html) of [SlickGrid's](https://github.com/6pac/SlickGrid) paged scrolling algorithm. `VirtualScroll` uses two instances of the hook to handle scrolling in two dimensions.

`VirtualScroll` provides scrolling over an arbitrary size scrollable area. Rendering visible content in response to changes in scroll position is left to child components. 

`DisplayList` and `DisplayGrid` are controlled components that render a window onto virtualized lists and grids.

`AutoSizer` is a higher level component that dynamically measures the size available and passes an explicit width and height to its children.

`VirtualList` = `VirtualScroll` + `AutoSizer` + `DisplayList`.

`VirtualGrid` = `VirtualScroll` + `AutoSizer` + `DisplayGrid`. 

## VirtualList Example

```jsx
import { VirtualList, useVariableSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

const mapping = useVariableSizeItemOffsetMapping(30, [50]);
const list = React.useRef(null);

...

<VirtualList
  ref={list}
  height={240}
  itemCount={1000000000000}
  itemOffsetMapping={mapping}
  width={600}>
  {Row}
</VirtualList>
```

Check out the [full sample](https://github.com/TheCandidStartup/infinisheet/tree/main/packages/react-virtual-scroll/sandboxes/trillion-row-list) or [try it out on Storybook](https://www.thecandidstartup.org/infinisheet/storybook/?path=/docs/react-virtual-scroll-virtuallist--docs)

## VirtualGrid Example

```jsx
import { VirtualGrid, useVariableSizeItemOffsetMapping, useFixedSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

const rowMapping = useVariableSizeItemOffsetMapping(30, [50]);
const columnMapping = useFixedSizeItemOffsetMapping(280);
const grid = React.useRef(null);

...

<VirtualGrid
  ref={grid}
  height={240}
  rowCount={1000000000000}
  rowOffsetMapping={rowMapping}
  columnCount={1000000000000}
  columnOffsetMapping={columnMapping}
  width={600}>
  {Cell}
</VirtualGrid> 
```

Check out the [full sample](https://github.com/TheCandidStartup/infinisheet/tree/main/packages/react-virtual-scroll/sandboxes/trillion-square-grid) or [try it out on Storybook](https://www.thecandidstartup.org/infinisheet/storybook/?path=/docs/react-virtual-scroll-virtualgrid--docs)

# More

Want to know more? Check out my [blog](https://www.thecandidstartup.org/topics/react-virtual-scroll.html)
