/// <reference types="vitest" />
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    globals: true,
    includeSource: ['src/**/*.{js,ts}'], 
    environment: 'jsdom',
    setupFiles: '../../shared/test/setup-jsdom.ts',
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
      exclude: ['src/test/**','src/*.*test.*','src/*.bench.*'],
    },
  },
  define: { 
    'import.meta.vitest': 'undefined', 
  },
})