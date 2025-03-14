import type { ItemOffsetMapping } from './ItemOffsetMapping';

/**
 * Implementation of {@link ItemOffsetMapping} for use when initial items have variable sizes.
 */
export class VariableSizeItemOffsetMapping implements ItemOffsetMapping {
  /**
   * @param defaultItemSize - Size to use for all other items
   * @param sizes - Array of sizes to use for the initial items, one size per item
   */
  constructor (defaultItemSize: number, sizes: number[]) {
    this.#defaultItemSize = defaultItemSize;
    this.#sizes = sizes;
  }

  itemSize(itemIndex: number): number {
    return (itemIndex < this.#sizes.length) ? this.#sizes[itemIndex] : this.#defaultItemSize;
  }

  itemOffset(itemIndex: number): number {
    let offset = 0;
    let length = this.#sizes.length;
    if (itemIndex > length) {
      const numDefaultSize = itemIndex - length;
      offset = numDefaultSize * this.#defaultItemSize;
    } else {
      length = itemIndex;
    }
    
    for (let i = 0; i < length; i ++)
    {
      offset += this.#sizes[i];
    }

    return offset;
  }

  offsetToItem(offset: number): [itemIndex: number, startOffset: number] {
    let startOffset = 0;
    const length = this.#sizes.length;
    for (let i = 0; i < length; i ++) {
      const size = this.#sizes[i];
      if (startOffset + size > offset) {
        return [i, startOffset];
      }
      startOffset += size;
    }

    const itemIndex = Math.floor((offset - startOffset) / this.#defaultItemSize);
    startOffset += itemIndex * this.#defaultItemSize;

    return [itemIndex+length, startOffset];
  }

  #defaultItemSize: number;
  #sizes: number[];
}
