import { useFixedSizeItemOffsetMapping, useVariableSizeItemOffsetMapping, ItemOffsetMapping, ScrollLayout } from '@candidstartup/react-virtual-scroll';

const mappingVariableVertical = useVariableSizeItemOffsetMapping(30, [50]);
const mappingFixedVertical = useFixedSizeItemOffsetMapping(30);
const mappingVariableHorizontal = useVariableSizeItemOffsetMapping(100, [150]);
const mappingFixedHorizontal = useFixedSizeItemOffsetMapping(100);

function rewriteMapping(mapping: ItemOffsetMapping, layout?: ScrollLayout): ItemOffsetMapping {
  if (layout === 'horizontal') {
    switch (mapping) {
      case mappingVariableVertical: return mappingVariableHorizontal;
      case mappingFixedVertical: return mappingFixedHorizontal;
    }
    return mapping;
  } else {
    switch (mapping) {
      case mappingVariableHorizontal: return mappingVariableVertical;
      case mappingFixedHorizontal: return mappingFixedVertical;
    }
  }

  return mapping;
}

export { mappingVariableVertical, mappingFixedVertical, mappingVariableHorizontal, mappingFixedHorizontal, rewriteMapping }
export type { ItemOffsetMapping, ScrollLayout } from '@candidstartup/react-virtual-scroll';
