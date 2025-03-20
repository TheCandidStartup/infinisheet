import type { StrictArgTypes, SBType, SBUnionType } from 'storybook/internal/types';
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

function isUnionUndefined(sbType: SBType): sbType is SBUnionType {
  if (sbType.name !== 'union')
    return false;

  const last = sbType.value.at(-1);
  return last !== undefined && last.name === 'other' && last.value === 'undefined';
}

function stripUnionUndefinedRaw(raw: string | undefined): string | undefined {
  return raw ? raw.replace(/\s*\|\s*undefined/, "") : undefined;
}

// Return [sub-SBType, name, raw] after stripping "| undefined" from the type
function stripUnionUndefined(sbType: SBUnionType): [SBType, string, string|undefined] {

  const raw = stripUnionUndefinedRaw(sbType.raw);
  if (sbType.value.length > 2)
    return [sbType, 'union', raw];

  const first = sbType.value[0]!;
  return [first, first.name, raw];
}

export const extractArgTypes: ArgTypesExtractor = (component) => {
  const props = extractComponentProps(component, 'props');
  if (!props)
    return null;

  return props.reduce((acc: StrictArgTypes, prop) => {
    let { type, defaultValue, description } = prop.propDef;
    const { name, jsDocTags, required } = prop.propDef;
    let sbType = prop.propDef.sbType as SBType; // Annoyingly sbType is typed as any rather than SBType

    let sbName: string = sbType.name;
    let sbRaw = sbType.raw;
    if (!required && isUnionUndefined(sbType)) {
      [sbType, sbName, sbRaw] = stripUnionUndefined(sbType);
      type = { summary: sbRaw ? sbRaw : sbName };
    }
    

    // Default uses "union" as the type description for these cases. Provide something useful instead.
    if (sbName === 'enum' || sbName === 'union') {
      type = { summary: sbName, ...(sbRaw ? { detail: sbRaw } : {}) };
    }

    // Default removes and ignores @defaultValue tags. Look them up in the original docgenInfo
    // and use them. There's limited space in "Default" column so use summary and detail if value
    // too large.
    const result = prop.docgenInfo.description.match(/\n\s*@defaultValue\s+`*([^\n`]+)`*(\n|$)/);
    if (result && result[1] !== undefined) {
      const value = result[1];
      if (value.length > 15 && sbName) {
        defaultValue = { summary: sbName, detail: value }
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

    acc[name] = { name, ...(description ? { description } : {}), 
      type: { required, ...sbType },
      table: { 
        ...(type ? { type } : {}),
        ...(jsDocTags ? { jsDocTags } : {}),
        ...(defaultValue ? { defaultValue } : {}),
      }
    }
    return acc;
  }, {});
};

