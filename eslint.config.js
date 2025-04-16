// eslint-disable import/no-extraneous-dependencies
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { fileURLToPath } from 'url';
import path from 'path';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import eslintImport from 'eslint-plugin-import';

// Resolve __dirname in ESM
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname, // Optional, default to process.cwd()
});

export default [
  js.configs.recommended,
  // Migrate extends using FlatCompat
  ...compat.extends('prettier'),

  // Migrate env using FlatCompat
  ...compat.env({
    jest: true,
    es2021: true,
    node: true,
  }),

  // Migrate plugins using FlatCompat and fixupPluginRoles for compatibility
  // ...compat.plugins('older plugins'),
  {
    ignores: ['node_modules/*', '.serverless/*', 'eslint.config.js'],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'import/extensions': 0,
      'no-use-before-define': 'off',
      'no-only-tests/no-only-tests': 'error',
      'no-console': 1,
    },
    plugins: {
      'no-only-tests': noOnlyTests,
      import: eslintImport,
    },
  },
];
