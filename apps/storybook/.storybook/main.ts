import type { StorybookConfig } from "@storybook/react-vite";

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
const getAbsolutePath = (packageName: string) =>
  dirname(fileURLToPath(import.meta.resolve(`${packageName}/package.json`)));

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  core: {
    disableTelemetry: true,
  },
  staticDirs: ['../assets'],
  addons: [getAbsolutePath("@storybook/addon-docs")],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  async viteFinal(config, options) { 
    const { mergeConfig } = await import("vite");

    // Production build for testing doesn't use tsconfigPaths resolution
    // to ensure that it builds against dependent packages
    // from the monorepo rather than pulling in src directly.
    // Want to make sure that I'm eating my own dog food.
    // Doing this disables Autodocs but that's alright because docs
    // are excluded from --test builds.
    if (options.configType === 'PRODUCTION' && options.test) {
      console.log("Production build for testing - importing from monorepo built packages");
      return config;
    }

    // Enable tsconfigPaths resolution for other builds for Autodocs support and
    // nice development experience where I can edit src files
    // in dependent packages and have storybook immediately update.
    return mergeConfig(config, {
      resolve: {
        tsconfigPaths: true
      },
    })
  }
};
export default config;
