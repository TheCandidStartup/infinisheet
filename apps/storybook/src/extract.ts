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
    let { type } = prop.propDef;
    const { name, description, defaultValue: defaultSummary, jsDocTags, required } = prop.propDef;
    const sbType = prop.propDef.sbType as SBType; // Annoyingly sbType is typed as any rather than SBType

    if (sbType.name === 'enum' || sbType.name === 'union')
      type = { summary: sbType.name, detail: sbType.raw };

    acc[name] = { name, description, 
      type: { required, ...sbType },
      table: { 
        type: type ?? undefined,
        jsDocTags,
        defaultValue: defaultSummary ?? undefined,
      }
    }
    return acc;
  }, {});
};

