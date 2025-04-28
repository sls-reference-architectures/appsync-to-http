import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import pluginJest from 'eslint-plugin-jest';
import noOnlyTests from 'eslint-plugin-no-only-tests';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    plugins: { js },
    rules: { 'max-params': ['warn', 1], 'no-param-reassign': ['error', { props: true }] },
  },
  {
    files: ['**/test/**/*.js', '**/*test*.js'],
    languageOptions: { globals: pluginJest.environments.globals.globals },
    plugins: { jest: pluginJest, 'no-only-tests': noOnlyTests },
    rules: { 'no-only-tests/no-only-tests': 'error' },
  },
]);
