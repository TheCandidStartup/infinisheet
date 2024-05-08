import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    include: /\.js$/,
    exclude: [],
    loader: 'jsx',
  },
})
