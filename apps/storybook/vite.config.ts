import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sourcemaps from '@gordonmleigh/rollup-plugin-sourcemaps'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // tsconfigPaths is added in /storybook/main.ts viteFinal
  ],
  build: {
    sourcemap: true,
    rollupOptions:  {
      plugins: [sourcemaps()],
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
