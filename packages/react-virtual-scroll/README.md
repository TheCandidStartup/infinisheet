# @candidstartup/react-virtual-scroll

React virtual scrolling components for lists and grids following the same philosophy as [react-window](https://github.com/bvaughn/react-window). Written in TypeScript using modern React. Scalable to trillions of rows and columns. 

## Interface

The interface is similar to `react-window` with two main changes. First, the components are functional rather than class based. Second, rather than having fixed and variable size variants of each component, the components are passed an `ItemOffsetMapping` object as a prop. This is an interface that the components query to determine the size and position of each item. 

The interface is [designed](https://www.thecandidstartup.org/2024/02/12/modern-react-virtual-scroll-grid-3.html) to ensure that the components have no scaling issues even with trillions of rows or columns. The package includes basic fixed and variable size item mappings. 

## Implementation

Most of the logic is implemented by custom hooks that are used by both `VirtualList` and `VirtualGrid` controls. The logic that manages scrolling in a single dimension is implemented in `useVirtualScroll`. It's based on an [improved version](https://www.thecandidstartup.org/2024/04/29/modern-react-virtual-scroll-grid-9.html) of [SlickGrid's](https://github.com/6pac/SlickGrid) paged scrolling algorithm. One instance of the hook is used by `VirtualList` and two instances by `VirtualGrid`. 

## VirtualList Example

```jsx
import { VirtualList, useVariableSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

const mapping = useVariableSizeItemOffsetMapping(30, [50]);

const Row = ({ index, isScrolling, style }) => (
  <div className={ index == 0 ? "header" : ( isScrolling ? "cellScroll" : "cell") } style={style}>
    { (index == 0) ? "Header" : "Item " + index }
  </div>
);

<VirtualList
  height={240}
  itemCount={1000000000000}
  itemOffsetMapping={mapping}
  useIsScrolling={true}
  width={600}>
  {Row}
</VirtualList>
```

## VirtualGrid Example

```jsx
import { VirtualList, useVariableSizeItemOffsetMapping, useFixedSizeItemOffsetMapping } from '@candidstartup/react-virtual-scroll';

const rowMapping = useVariableSizeItemOffsetMapping(30, [50]);
const columnMapping = useFixedSizeItemOffsetMapping(280);

const Cell = ({ rowIndex, columnIndex, style }) => (
  <div className={ rowIndex == 0 ? "header" : "cell" } style={style}>
    { (rowIndex == 0) ? `${columnIndex}` : `${rowIndex}:${columnIndex}` }
  </div>

<VirtualGrid
  height={240}
  rowCount={1000000000000}
  rowOffsetMapping={rowMapping}
  columnCount={1000000000000}
  columnOffsetMapping={columnMapping}
  width={600}>
  {Cell}
</VirtualGrid> 
```

# More

Want to know more? Check out my [blog](https://www.thecandidstartup.org/topics/frontend.html)
