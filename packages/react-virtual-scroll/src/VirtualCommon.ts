import type { ItemOffsetMapping } from "@candidstartup/infinisheet-types";

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

  const [baseIndex, startOffset] = itemOffsetMapping.offsetToItem(scrollOffset);
  if (baseIndex >= itemCount) {
    return [0, 0, 0, []];
  }

  let itemIndex = Math.max(0, Math.min(itemCount - 1, baseIndex));
  const endOffset = scrollOffset + clientExtent;

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
  let lastSize = sizes[0]!;
  let repeat = 1;

  for (let i = 1; i < count; i ++) {
    const size = sizes[i]!;
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


