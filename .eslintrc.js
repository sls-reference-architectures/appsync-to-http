module.exports = {
  env: {
    jest: true,
    es2022: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['no-only-tests'],
  root: true,
  rules: {
    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'no-use-before-define': 'off',
    'no-only-tests/no-only-tests': 'error',
    'no-console': 1,
  },
};
