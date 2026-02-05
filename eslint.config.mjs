import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import jsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  reactRecommended,
  reactRefresh.configs.vite(),
  jsxRuntime,
  { files: ["**/*.ts", "**/*.tsx"] },
  { ignores: ["**/dist", "**/*.js", "**/*.mjs", "**/*.cjs", "**/vite.config.ts", "**/playwright.config.ts"] },
  {
    languageOptions: {
      globals: { ...globals.browser }
    },
    plugins: {
      "react-hooks": eslintPluginReactHooks
    },
    settings: {
      "react": {
        "version": "detect"
      }
    },
    rules: {
      "react-refresh/only-export-components": ["warn", {
          allowConstantExport: true,
      }],

      "@typescript-eslint/no-unused-vars": ["error", {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
      }],

      "@typescript-eslint/no-empty-object-type": ["error", {
          allowInterfaces: 'with-single-extends'
      }],

      "react-hooks/exhaustive-deps": "error"
    } 
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "react/display-name": "off"
    }
  }
);
