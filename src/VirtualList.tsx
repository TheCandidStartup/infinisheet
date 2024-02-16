import React from "react";
import { useVirtualScroll } from './useVirtualScroll';
import { useIsScrolling as useIsScrollingHook} from './useIsScrolling';

export type RenderComponentProps = {
  data: any,
  index: number,
  isScrolling?: boolean,
  style: Object,
};

export type RenderComponent = React.ComponentType<RenderComponentProps>;

export interface ItemOffsetMapping {
  itemSize(itemIndex: number): number;
  itemOffset(itemIndex: number): number;
  offsetToItem(offset: number): [itemIndex: number, startOffset: number];
};

export type VirtualListProps = {
  children: RenderComponent,
  height: number,
  width: number,
  itemCount: number,
  itemOffsetMapping: ItemOffsetMapping,
  itemData?: any,
  itemKey?: (index: number, data: any) => any,
  useIsScrolling?: boolean,
};

type RangeToRender = [
  startIndex: number,
  startOffset: number,
  sizes: number[]
];

function getRangeToRender(itemCount: number, itemOffsetMapping: ItemOffsetMapping, clientExtent: number, scrollOffset: number): RangeToRender {
  if (itemCount == 0) {
    return [0, 0, []];
  }

  var [itemIndex, startOffset] = itemOffsetMapping.offsetToItem(scrollOffset);
  itemIndex = Math.max(0, Math.min(itemCount - 1, itemIndex));
  var endOffset = scrollOffset + clientExtent;

  const overscanBackward = 1;
  const overscanForward = 1;

  for (let step = 0; step < overscanBackward && itemIndex > 0; step ++) {
    itemIndex --;
    startOffset -= itemOffsetMapping.itemSize(itemIndex);
  }

  const startIndex = itemIndex;
  var offset = startOffset;
  const sizes: number[] = [];

  while (offset < endOffset && itemIndex < itemCount) {
    const size = itemOffsetMapping.itemSize(itemIndex);
    sizes.push(size);
    offset += size;
    itemIndex ++;
  }

  for (let step = 0; step < overscanForward && itemIndex < itemCount; step ++) {
    const size = itemOffsetMapping.itemSize(itemIndex);
    sizes.push(size);
    itemIndex ++;
  }

  return [startIndex, startOffset, sizes];
}

const defaultItemKey = (index: number, _data: any) => index;
type ScrollEvent = React.SyntheticEvent<HTMLDivElement>;

export function VirtualList(props: VirtualListProps): React.JSX.Element {
  const { width, height, itemCount, itemOffsetMapping, children, 
    itemData = undefined, itemKey = defaultItemKey, useIsScrolling = false } = props;

  const outerRef = React.useRef<HTMLDivElement>(null);
  const [{ scrollOffset }, onScrollExtent] = useVirtualScroll();
  const isScrolling = useIsScrollingHook(outerRef); 

  // Total size is same as offset to item one off the end
  const totalSize = itemOffsetMapping.itemOffset(itemCount);

  function onScroll(event: ScrollEvent) {
    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
    onScrollExtent(clientHeight, scrollHeight, scrollTop);
  }

  const [startIndex, startOffset, sizes] = getRangeToRender(itemCount, itemOffsetMapping, height, scrollOffset);

  // We can decide the JSX child type at runtime as long as we use a variable that uses the same capitalized
  // naming convention as components do. 
  const ChildVar = children;

  // Being far too clever. Implementing a complex iteration in JSX in a map expression by abusing the comma operator. 
  // You can't declare local variables in an expression so they need to be hoisted out of the JSX. The comma operator
  // returns the result of the final statement which makes the iteration a little clumsier.
  let nextOffset = startOffset;
  let index, offset;

  return (
    <div onScroll={onScroll} ref={outerRef} style={{ position: "relative", height, width, overflow: "auto", willChange: "transform" }}>
      <div style={{ height: totalSize, width: "100%" }}>
        {sizes.map((size, arrayIndex) => (
          offset = nextOffset,
          nextOffset += size,
          index = startIndex + arrayIndex,
          <ChildVar data={itemData} key={itemKey(index, itemData)} index={index}
                    isScrolling={useIsScrolling ? isScrolling : undefined}
                    style={{ position: "absolute", top: offset, height: size, width: "100%" }}/>
        ))}
      </div>
    </div>
  );
};

export default VirtualList;
