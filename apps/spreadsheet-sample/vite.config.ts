import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sourcemaps from '@gordonmleigh/rollup-plugin-sourcemaps'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    tsconfigPaths: true
  },
  build: {
    sourcemap: true,
    rolldownOptions:  {
      plugins: [sourcemaps()],
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
      },
      output: {
        codeSplitting: {
          groups: [
            {
              test: /node_modules/,
              name: 'vendor',
            },
          ],
        },
      }
    }
  }
})
