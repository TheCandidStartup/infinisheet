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
  staticDirs: ['../assets'],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  async viteFinal(config, options) { 
    const { mergeConfig } = await import("vite");

    // Production build for testing doesn't use tsconfigPaths plugin
    // to ensure that it builds against dependent packages
    // from the monorepo rather than pulling in src directly.
    // Want to make sure that I'm eating my own dog food.
    // Doing this disables Autodocs but that's alright because docs
    // are excluded from --test builds.
    if (options.configType === 'PRODUCTION' && options.test) {
      console.log("Production build for testing - importing from monorepo built packages");
      return config;
    }

    // Add tsconfigPaths plugin for other builds for Autodocs support and
    // nice development experience where I can edit src files
    // in dependent packages and have storybook immediately update.
    return mergeConfig(config, {
      plugins: [ tsconfigPaths() ]
    })
  }
};
export default config;
