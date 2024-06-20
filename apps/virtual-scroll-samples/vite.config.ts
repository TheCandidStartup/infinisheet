import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import sourcemaps from '@gordonmleigh/rollup-plugin-sourcemaps'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()
  ],
  build: {
    sourcemap: true,
    rollupOptions:  {
      plugins: [sourcemaps()],
      input: {
        main: resolve(__dirname, 'index.html'),
        "list-and-grid": resolve(__dirname, 'samples/list-and-grid/index.html'),
        "trillion-row-list": resolve(__dirname, 'samples/trillion-row-list/index.html'),
        "trillion-square-grid": resolve(__dirname, 'samples/trillion-square-grid/index.html'),
        "horizontal-list": resolve(__dirname, 'samples/horizontal-list/index.html'),
        "paging-functional-test": resolve(__dirname, 'samples/paging-functional-test/index.html'),
        "spreadsheet": resolve(__dirname, 'samples/spreadsheet/index.html'),
        "padding": resolve(__dirname, 'samples/padding/index.html'),
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
