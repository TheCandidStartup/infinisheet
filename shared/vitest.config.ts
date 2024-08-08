/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'

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
      exclude: ['src/test/**'],
    },
    fakeTimers: {
      toFake: [...(configDefaults.fakeTimers.toFake ?? []), 'performance'],
    },
  },
  define: { 
    'import.meta.vitest': 'undefined', 
  },
})