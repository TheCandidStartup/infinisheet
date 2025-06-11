import type { ItemOffsetMapping } from './ItemOffsetMapping';

/**
 * Implementation of {@link ItemOffsetMapping} for use when all items have a fixed size
 */
export class FixedSizeItemOffsetMapping implements ItemOffsetMapping {
  /**
   * @param itemSize - Size to use for all items
   */
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

  private fixedItemSize: number;
}

