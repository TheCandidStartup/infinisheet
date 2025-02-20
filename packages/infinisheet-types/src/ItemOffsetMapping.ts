/**
 * Interface used to determine the size and positioning offset for items in a single dimension. 
 */
export interface ItemOffsetMapping {
  /** Size of item with given index */
  itemSize(itemIndex: number): number;

  /** Offset from start of container to specified item
   * 
   * `itemOffset(n)` should be equal to `Sum{i:0->n-1}(itemSize(i))`
   * 
   * To efficiently support large containers, cost should be `O(logn)` or better.
   */
  itemOffset(itemIndex: number): number;

  /** Given an offset, return the index of the item that intersects that offset, together with the start offset of that item */
  offsetToItem(offset: number): [itemIndex: number, startOffset: number];
}
