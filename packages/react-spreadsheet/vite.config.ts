/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { mergeConfig } from 'vitest/config'
import configShared from '../../shared/vitest.config'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default mergeConfig(
  configShared,
  defineConfig({
    plugins: [react()],
  })
)
