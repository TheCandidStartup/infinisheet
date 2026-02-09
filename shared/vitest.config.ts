/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths()
  ],
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