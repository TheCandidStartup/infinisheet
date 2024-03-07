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
    setupFiles: './src/test/setup.ts'
  },
  define: { 
    'import.meta.vitest': 'undefined', 
  },
})
