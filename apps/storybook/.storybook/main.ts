import type { StorybookConfig } from "@storybook/react-vite";
import tsconfigPaths from 'vite-tsconfig-paths';

import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  async viteFinal(config, { configType }) { 
    const { mergeConfig } = await import("vite");

    // Production build doesn't use tsconfigPaths plugin
    // to ensure that it builds against dependent packages
    // from the monorepo rather than pulling in src directly.
    // Want to make sure that I'm eating my own dog food.
    if (configType === 'PRODUCTION')
      return config;

    // Add tsconfigPaths plugin for development build for
    // nice development experience where I can edit src files
    // in dependent packages and have storybook immediately update.
    return mergeConfig(config, {
      plugins: [ tsconfigPaths() ]
    })
  }
};
export default config;
