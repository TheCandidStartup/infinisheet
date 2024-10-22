import type { ItemOffsetMapping, ScrollToOption } from "./VirtualBase";

type RangeToRender = [
  startIndex: number,
  startOffset: number,
  sizes: number[]
];

export function getRangeToRender(itemCount: number, itemOffsetMapping: ItemOffsetMapping, clientExtent: number, scrollOffset: number): RangeToRender {
  if (itemCount == 0) {
    return [0, 0, []];
  }

  // Negative offset equivalent to reducing the size of the window (possibly down to nothing)
  if (scrollOffset < 0) {
    clientExtent += scrollOffset;
    scrollOffset = 0;
  }

  if (clientExtent <= 0) {
    return [0, 0, []];
  }

  let [itemIndex, startOffset] = itemOffsetMapping.offsetToItem(scrollOffset);
  if (itemIndex >= itemCount) {
    return [0, 0, []];
  }
  
  itemIndex = Math.max(0, Math.min(itemCount - 1, itemIndex));
  const endOffset = scrollOffset + clientExtent;

  const overscanBackward = 1;
  const overscanForward = 1;

  for (let step = 0; step < overscanBackward && itemIndex > 0; step ++) {
    itemIndex --;
    startOffset -= itemOffsetMapping.itemSize(itemIndex);
  }

  const startIndex = itemIndex;
  let offset = startOffset;
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

function formatRepeat(repeat: number, size: number): string {
  return (repeat == 1) ? `${size}px` : `repeat(${repeat},${size}px)`;
}

function join(a: string|undefined, s: string) {
  return a ? a + ' ' + s : s;
}

export function getGridTemplate(sizes: number[]): string | undefined {
  const count = sizes.length;
  if (count == 0)
    return undefined;

  let ret = undefined;
  let lastSize = sizes[0];
  let repeat = 1;

  for (let i = 1; i < count; i ++) {
    const size = sizes[i];
    if (size == lastSize) {
      repeat ++;
    } else {
      const s = formatRepeat(repeat, lastSize);
      ret = join(ret,s);
      lastSize = size;
      repeat = 1;
    }
  }

  const s = formatRepeat(repeat, lastSize);
  return join(ret,s);
}

export function getOffsetToScroll(index: number | undefined, itemOffsetMapping: ItemOffsetMapping, 
  clientExtent: number, scrollOffset: number, option?: ScrollToOption): number | undefined
{
  if (index === undefined)
    return undefined;

  const itemOffset = itemOffsetMapping.itemOffset(index);
  if (option != 'visible')
    return itemOffset;

  // Start of item offscreen before start of viewport?
  if (itemOffset < scrollOffset)
    return itemOffset;

  // Already completely visible?
  const itemSize = itemOffsetMapping.itemSize(index);
  const endOffset = itemOffset + itemSize;
  const endViewport = scrollOffset + clientExtent;
  if (endOffset <= endViewport)
    return undefined;

  // Item offscreen past end of viewport

  // Item bigger than viewport? Make sure start is in view
  if (itemSize > clientExtent)
    return itemOffset;

  // Scroll so end of item aligns with end of viewport
  return itemOffset - clientExtent + itemSize;
 }