import { ItemOffsetMapping } from './VirtualBase';

class FixedSizeItemOffsetMapping implements ItemOffsetMapping {
  constructor (itemSize: number) {
    this.fixedItemSize = itemSize;
  }

  itemSize(_itemIndex: number): number {
    return this.fixedItemSize;
  }

  itemOffset(itemIndex: number): number {
    return itemIndex * this.fixedItemSize;
  }

  offsetToItem(offset: number): [itemIndex: number, startOffset: number] {
    const itemIndex = Math.floor(offset / this.fixedItemSize);
    const startOffset = itemIndex * this.fixedItemSize;

    return [itemIndex, startOffset];
  }

  fixedItemSize: number;
};

export function useFixedSizeItemOffsetMapping(itemSize: number) {
  return new FixedSizeItemOffsetMapping(itemSize);
};

export default useFixedSizeItemOffsetMapping;
