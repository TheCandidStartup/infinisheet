import { defineConfig } from 'vite'

// Needed to run combined coverage test at workspace level
// https://vitest.dev/guide/workspace#configuration
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      include: ['packages/*/src/**'],
      exclude: ['packages/*/src/test/**'],
    },
  },
})