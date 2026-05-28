import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '**/dist/**',
      'coverage/**',
      '自习室预约/**',
      'apps/api/generated/**',
      'docs/api/openapi.yaml',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        App: 'readonly',
        Component: 'readonly',
        Page: 'readonly',
        getApp: 'readonly',
        getCurrentPages: 'readonly',
        wx: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);
