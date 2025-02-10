import type { StrictArgTypes, SBType } from 'storybook/internal/types';
import type { ArgTypesExtractor, Component } from 'storybook/internal/docs-tools';
import { extractComponentProps, extractComponentDescription as baseExtractComponentDescription} from 'storybook/internal/docs-tools';

export const extractComponentDescription = (component: Component) => { 
  const description = baseExtractComponentDescription(component);
  return description;
};

export const extractArgTypes: ArgTypesExtractor = (component) => {
  const props = extractComponentProps(component, 'props');
  if (!props)
    return null;

  return props.reduce((acc: StrictArgTypes, prop) => {
    let { type, defaultValue } = prop.propDef;
    const { name, description, jsDocTags, required } = prop.propDef;
    const sbType = prop.propDef.sbType as SBType; // Annoyingly sbType is typed as any rather than SBType

    if (sbType.name === 'enum' || sbType.name === 'union')
      type = { summary: sbType.name, detail: sbType.raw };

    const result = prop.docgenInfo.description.match(/\n\s*@defaultValue\s+`*([^\n`]+)`*(\n|$)/);
    console.log("Result", result);
    if (result) {
      const value = result[1];
      if (value.length > 10 && sbType.name) {
        defaultValue = { summary: sbType.name, detail: value }
      } else {
        defaultValue = { summary: value }
      }
    }

    acc[name] = { name, description, 
      type: { required, ...sbType },
      table: { 
        type: type ?? undefined,
        jsDocTags,
        defaultValue: defaultValue ?? undefined,
      }
    }
    return acc;
  }, {});
};

