// module.exports = {
//   env: {
//     jest: true,
//     node: true,
//   },
//   extends: [
//     'eslint:recommended',
//     'plugin:@typescript-eslint/eslint-recommended',
//     'plugin:@typescript-eslint/recommended',
//     'airbnb-base',
//   ],
//   parser: '@typescript-eslint/parser',
//   plugins: ['@typescript-eslint'],
//   root: true,
//   rules: {
//     'no-use-before-define': 0,
//     'import/extensions': 0,
//     'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.ts'] }],
//     '@typescript-eslint/no-var-requires': 0,
//   },
//   settings: {
//     'import/resolver': {
//       typescript: {
//         alwaysTryTypes: true,
//       },
//     },
//   },
// };

module.exports = {
  env: {
    jest: true,
    node: true,
  },
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['no-only-tests'],
  root: true,
  rules: {
    'import/extensions': 0,
    'no-only-tests/no-only-tests': 'error',
    'no-console': 2,
    'no-underscore-dangle': 0,
    'no-use-before-define': 0,
    '@typescript-eslint/no-use-before-define': 0,
  },
  settings: {
    'import/resolver': 'node',
  },
};
