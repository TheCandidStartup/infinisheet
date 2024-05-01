/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import sourcemaps from '@gordonmleigh/rollup-plugin-sourcemaps';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()
  ],
  build: {
    sourcemap: true,
    rollupOptions:  {
      plugins: [sourcemaps()]
    }
  }
})
