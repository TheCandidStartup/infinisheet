import { ItemOffsetMapping, FixedSizeItemOffsetMapping } from '@candidstartup/infinisheet-types';
export type { ItemOffsetMapping } from '@candidstartup/infinisheet-types';

/**
 * Returns an instance of {@link ItemOffsetMapping} suitable for use when all items have a fixed size.
 * 
 * @param itemSize - Size to use for all items
 */
export function useFixedSizeItemOffsetMapping(itemSize: number): ItemOffsetMapping {
  return new FixedSizeItemOffsetMapping(itemSize);
}

export default useFixedSizeItemOffsetMapping;
