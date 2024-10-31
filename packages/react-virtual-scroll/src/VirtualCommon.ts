import type { ItemOffsetMapping, ScrollToOption } from "./VirtualBase";

type RangeToRender = [
  startIndex: number,
  startOffset: number,
  totalSize: number,
  sizes: number[]
];

export function getRangeToRender(itemCount: number, itemOffsetMapping: ItemOffsetMapping, clientExtent: number, scrollOffset: number): RangeToRender {
  if (itemCount == 0) {
    return [0, 0, 0, []];
  }

  // Negative offset equivalent to reducing the size of the window (possibly down to nothing)
  if (scrollOffset < 0) {
    clientExtent += scrollOffset;
    scrollOffset = 0;
  }

  if (clientExtent <= 0) {
    return [0, 0, 0, []];
  }

  let [itemIndex, startOffset] = itemOffsetMapping.offsetToItem(scrollOffset);
  if (itemIndex >= itemCount) {
    return [0, 0, 0, []];
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
  let totalSize = 0;

  while (offset < endOffset && itemIndex < itemCount) {
    const size = itemOffsetMapping.itemSize(itemIndex);
    sizes.push(size);
    totalSize += size;
    offset += size;
    itemIndex ++;
  }

  for (let step = 0; step < overscanForward && itemIndex < itemCount; step ++) {
    const size = itemOffsetMapping.itemSize(itemIndex);
    sizes.push(size);
    totalSize += size;
    itemIndex ++;
  }

  return [startIndex, startOffset, totalSize, sizes];
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

export function getOffsetToScrollRange(offset: number | undefined, size: number | undefined, 
  clientExtent: number, scrollOffset: number, option?: ScrollToOption): number | undefined
{
  if (offset === undefined)
    return undefined;

  if (option != 'visible')
    return offset;

  // Start of item offscreen before start of viewport?
  if (offset < scrollOffset)
    return offset;

  size = size || 0;

  // Already completely visible?
  const endOffset = offset + size;
  const endViewport = scrollOffset + clientExtent;
  if (endOffset <= endViewport)
    return undefined;

  // Item offscreen past end of viewport

  // Item bigger than viewport? Make sure start is in view
  if (size > clientExtent)
    return offset;

  // Scroll so end of item aligns with end of viewport
  return offset - clientExtent + size;
 }

export function getOffsetToScroll(index: number | undefined, itemOffsetMapping: ItemOffsetMapping, 
  clientExtent: number, scrollOffset: number, option?: ScrollToOption): number | undefined
{
  if (index === undefined)
    return undefined;

  return getOffsetToScrollRange(itemOffsetMapping.itemOffset(index), itemOffsetMapping.itemSize(index), 
    clientExtent, scrollOffset, option);
 }
