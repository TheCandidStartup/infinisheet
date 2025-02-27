/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { mergeConfig } from 'vitest/config'
import configShared from '../../shared/vitest.config'

// https://vitejs.dev/config/
export default mergeConfig(
  configShared,
  defineConfig({
  })
)
