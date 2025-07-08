import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist/', 'node_modules/', 'tests/.node', 'docs/']),
  {
    files: ['**/*.{ts,mts,cts}'],
    linterOptions: {
      reportUnusedDisableDirectives: 'warn'
    }
  },
  {
    files: ['**/*.{ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended']
  },
  {
    files: ['**/*.{ts,mts,cts}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },

  tseslint.configs.strict
]);
