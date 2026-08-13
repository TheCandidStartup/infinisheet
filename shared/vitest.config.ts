/// <reference types="vitest" />
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    globals: true,
    includeSource: ['src/**/*.{js,ts}'], 
    environment: 'jsdom',
    setupFiles: '../../shared/test/setup-jsdom.ts',
    coverage: {
      provider: 'istanbul',
      include: ['src/**.{js,jsx,ts,tsx}'],
      exclude: ['src/test/**','src/*.*test.*','src/*.bench.*','**/.DS_Store'],
    },
  },
  define: { 
    'import.meta.vitest': 'undefined', 
  },
})