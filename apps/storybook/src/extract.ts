import type { StrictArgTypes, SBType } from 'storybook/internal/types';
import type { ArgTypesExtractor, Component } from 'storybook/internal/docs-tools';
import { extractComponentProps, extractComponentDescription as baseExtractComponentDescription} from 'storybook/internal/docs-tools';

// Strip out {@link type} tags. Most appropriate default is to format type as code. Could put in actual markdown links in future.
function replaceLinks(description: string): string {
  return description.replaceAll(/{@link\s+([^}]+)}/g, (_substring, p1) => {
    const value = p1 as string;
    return "`" + value + "`";
  })
}

export const extractComponentDescription = (component: Component): string => { 
  const description = baseExtractComponentDescription(component);

  const noGroup = description.replace(/\n\s*@group\s+([^\n]+)(\n|$)/, "");
  const fixedLinks = replaceLinks(noGroup);

  return fixedLinks;
};

export const extractArgTypes: ArgTypesExtractor = (component) => {
  const props = extractComponentProps(component, 'props');
  if (!props)
    return null;

  return props.reduce((acc: StrictArgTypes, prop) => {
    let { type, defaultValue, description } = prop.propDef;
    const { name, jsDocTags, required } = prop.propDef;
    const sbType = prop.propDef.sbType as SBType; // Annoyingly sbType is typed as any rather than SBType

    // Default uses "union" as the type description for these cases. Provide something useful instead.
    if (sbType.name === 'enum' || sbType.name === 'union')
      type = { summary: sbType.name, detail: sbType.raw };

    // Default removes and ignores @defaultValue tags. Look them up in the original docgenInfo
    // and use them. There's limited space in "Default" column so use summary and detail if value
    // too large.
    const result = prop.docgenInfo.description.match(/\n\s*@defaultValue\s+`*([^\n`]+)`*(\n|$)/);
    if (result) {
      const value = result[1];
      if (value.length > 15 && sbType.name) {
        defaultValue = { summary: sbType.name, detail: value }
      } else {
        defaultValue = { summary: value }
      }
    }

    if (description)
      description = replaceLinks(description);

    // Note that param descriptions are simple text rather than Markdown
    jsDocTags?.params?.forEach((param) => {
      if (param.description)
        param.description = replaceLinks(param.description);
    })

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

