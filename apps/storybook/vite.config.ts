import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // tsconfigPaths is added in /storybook/main.ts viteFinal
  ],

  // No build options as Storybook ignores them and uses it's own. If you do want to fiddle
  // with build options need to do it in viteFinal.
})
