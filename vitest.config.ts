import { defineConfig } from 'vite'

// Needed to run combined coverage test at workspace level
// https://vitest.dev/guide/workspace#configuration
export default defineConfig({
  test: {
    projects: ['packages/*/vite.config.ts'],
    coverage: {
      provider: 'istanbul',
      include: ['packages/*/src/**.{js,jsx,ts,tsx}'],
      exclude: ['packages/*/src/test/**', 'packages/*/src/*.*test.*', 'packages/*/src/*.bench.*','**/.DS_Store']
    },
  },
})