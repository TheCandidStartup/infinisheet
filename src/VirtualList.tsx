import React from "react";
import { useVirtualScroll } from './useVirtualScroll';

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

function renderItems(props: VirtualListProps, scrollOffset: number) {
  const { children, itemData = undefined, itemCount, itemOffsetMapping, height, itemKey = defaultItemKey } = props;

  const [startIndex, startOffset, sizes] = getRangeToRender(itemCount, itemOffsetMapping, height, scrollOffset);

  const items: JSX.Element[] = [];
  var offset = startOffset;
  sizes.forEach((size, arrayIndex) => {
    const index = startIndex + arrayIndex;
    items.push(
      React.createElement(children, {
        data: itemData,
        key: itemKey(index, itemData),
        index: index,
        // isScrolling: useIsScrolling ? isScrolling : undefined,
        style: { position: "absolute", top: offset, height: size, width: "100%" }
      })
    );
    offset += size;
  });

  return items;
}

type ScrollEvent = React.SyntheticEvent<HTMLDivElement>;

export function VirtualList(props: VirtualListProps): React.JSX.Element {
  const { width, height, itemCount, itemOffsetMapping } = props;

  const [{ scrollOffset }, onScrollExtent] = useVirtualScroll();

  // Total size is same as offset to item one off the end
  const totalSize = itemOffsetMapping.itemOffset(itemCount);

  function onScroll(event: ScrollEvent) {
    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
    onScrollExtent(clientHeight, scrollHeight, scrollTop);
  }

  return (
    <div onScroll={onScroll} style={{ position: "relative", height, width, overflow: "auto", willChange: "transform" }}>
      <div style={{ height: totalSize, width: "100%" }}>
        {renderItems(props, scrollOffset)}
      </div>
    </div>
  );
};

export default VirtualList;
