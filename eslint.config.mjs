import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from "eslint-plugin-react-refresh";
import tsdoc from "eslint-plugin-tsdoc";

import { fixupPluginRules } from '@eslint/compat';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactRecommended,
  { files: ["**/*.ts", "**/*.tsx"] },
  { ignores: ["**/dist", "**/*.js", "**/*.mjs", "**/*.cjs"] },
  {
    languageOptions: {
      globals: { ...globals.browser }
    },
    plugins: {
      "react-hooks": fixupPluginRules(eslintPluginReactHooks),
      "react-refresh": reactRefresh,
      tsdoc,
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

      "tsdoc/syntax": "error",
      "react-hooks/exhaustive-deps": "error",
    } 
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "react/display-name": "off"
    }
  }
);
