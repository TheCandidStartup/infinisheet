/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    includeSource: ['src/**/*.{js,ts}'], 
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'istanbul',
      include: ['src/**'],
      exclude: ['src/test/**'],
    },
  },
  define: { 
    'import.meta.vitest': 'undefined', 
  },
})
