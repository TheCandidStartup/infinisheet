/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    includeSource: ['src/**/*.{js,ts}'], 
    environment: 'jsdom'
  },
  define: { 
    'import.meta.vitest': 'undefined', 
  },
})
