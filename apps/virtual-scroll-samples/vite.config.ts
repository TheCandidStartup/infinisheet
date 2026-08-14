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
        "auto-sizer": resolve(import.meta.dirname, 'samples/auto-sizer/index.html'),
        "list-and-grid": resolve(import.meta.dirname, 'samples/list-and-grid/index.html'),
        "trillion-row-list": resolve(import.meta.dirname, 'samples/trillion-row-list/index.html'),
        "trillion-square-grid": resolve(import.meta.dirname, 'samples/trillion-square-grid/index.html'),
        "horizontal-list": resolve(import.meta.dirname, 'samples/horizontal-list/index.html'),
        "display-list": resolve(import.meta.dirname, 'samples/display-list/index.html'),
        "display-grid": resolve(import.meta.dirname, 'samples/display-grid/index.html'),
        "virtual-scroll": resolve(import.meta.dirname, 'samples/virtual-scroll/index.html'),
        "paging-functional-test": resolve(import.meta.dirname, 'samples/paging-functional-test/index.html'),
        "spreadsheet": resolve(import.meta.dirname, 'samples/spreadsheet/index.html'),
        "padding": resolve(import.meta.dirname, 'samples/padding/index.html'),
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
