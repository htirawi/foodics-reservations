/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    // Strict rules - no any/unknown
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',

    // Complexity limits
    complexity: ['error', 8],
    'max-depth': ['error', 2],
    'max-lines-per-function': [
      'error',
      { max: 50, skipComments: true, skipBlankLines: true },
    ],
    'max-lines': [
      'error',
      { max: 150, skipComments: true, skipBlankLines: true },
    ],
    'max-params': ['error', 4],
    'max-nested-callbacks': ['error', 2],

    // Vue specific
    'vue/multi-word-component-names': 'error',
    'vue/no-v-html': 'error',
    'vue/no-mutating-props': 'error',
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: { max: 3 },
        multiline: { max: 1 },
      },
    ],
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/block-lang': [
      'error',
      {
        script: { lang: 'ts' },
      },
    ],

    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
