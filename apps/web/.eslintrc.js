/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@repo/eslint-config/next.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  ignorePatterns: ['tailwind.config.js', 'postcss.config.js'],
  rules: {
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
      },
    ],
    'unicorn/prevent-abbreviations': 'off',
  },
};
