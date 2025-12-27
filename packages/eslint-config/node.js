/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./index.js'],
  env: {
    node: true,
    browser: false,
  },
  rules: {
    'no-console': 'off',
  },
};
