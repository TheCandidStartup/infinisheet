import { ItemOffsetMapping, VariableSizeItemOffsetMapping } from '@candidstartup/infinisheet-types';
export type { ItemOffsetMapping } from '@candidstartup/infinisheet-types';

/**
 * Returns an instance of {@link @candidstartup/infinisheet-types!ItemOffsetMapping | ItemOffsetMapping}
 * suitable for use when initial items have variable sizes.
 * 
 * @param defaultItemSize - Size to use for all other items
 * @param sizes - Array of sizes to use for the initial items, one size per item
 */
export function useVariableSizeItemOffsetMapping(defaultItemSize: number, sizes?: number[]): ItemOffsetMapping {
  return new VariableSizeItemOffsetMapping(defaultItemSize, sizes || []);
}

export default useVariableSizeItemOffsetMapping;
