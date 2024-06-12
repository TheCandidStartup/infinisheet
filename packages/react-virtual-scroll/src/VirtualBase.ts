import React from "react";

export interface VirtualBaseItemProps {
  data: any,
  isScrolling?: boolean,
  style: React.CSSProperties,
};

export interface VirtualBaseProps {
  className?: string,
  height: number,
  width: number,
  itemData?: any,
  useIsScrolling?: boolean,
  maxCssSize?: number,
  minNumPages?: number
};

export interface ItemOffsetMapping {
  itemSize(itemIndex: number): number;
  itemOffset(itemIndex: number): number;
  offsetToItem(offset: number): [itemIndex: number, startOffset: number];
};

export type ScrollEvent = React.SyntheticEvent<HTMLDivElement>;

type RangeToRender = [
  startIndex: number,
  startOffset: number,
  sizes: number[]
];

export function getRangeToRender(itemCount: number, itemOffsetMapping: ItemOffsetMapping, clientExtent: number, scrollOffset: number): RangeToRender {
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
