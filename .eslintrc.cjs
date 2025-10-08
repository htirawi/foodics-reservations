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
    extraFileExtensions: ['.vue'],
  },
  plugins: ['@typescript-eslint', 'vue', 'eslint-comments'],
  rules: {
    // Strict rules - no any/unknown
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    
    // Forbid TS comments - ban all @ts-* comments
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-ignore': true,
      'ts-nocheck': true,
      'ts-expect-error': true,
      'minimumDescriptionLength': 999 // effectively disallow
    }],

    // Forbid eslint directives globally (JS/TS/Vue)
    'eslint-comments/no-use': ['error', { allow: [] }],
    'eslint-comments/no-unlimited-disable': 'error',
    'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: false }],
    'eslint-comments/no-restricted-disable': 'error',
    'eslint-comments/require-description': 'error',

    // Vue comment directives validation (catches HTML <!-- eslint-... -->)
    'vue/comment-directive': ['error', { reportUnusedDisableDirectives: true }],

    // Prevent warning comments in code
    'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'anywhere' }],

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
    'vue/multi-word-component-names': ['error', {
      ignores: ['App', 'Home', 'Index', 'Error'] // Only essential exceptions
    }],
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
    'vue/require-explicit-emits': 'error',
    'vue/require-v-for-key': 'error',
    'vue/no-use-v-if-with-v-for': 'error',
    'vue/attribute-hyphenation': ['error', 'always'],

    // Prevent service imports in Vue components
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/services/**'],
            message: 'Service calls must go through stores or composables. Import services in stores/composables, not components.',
          },
          {
            group: ['axios'],
            message: 'Direct axios usage is forbidden in components. Use centralized HTTP service through stores/composables.',
          },
        ],
      },
    ],

    // Prevent async functions in Vue components (except tiny event handlers)
    'no-restricted-syntax': [
      'error',
      {
        selector: 'FunctionDeclaration[async=true]',
        message: 'Async functions in Vue components should be minimal event handlers that call composables/stores. Extract complex async logic to composables.',
      },
    ],

    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      // Enforce interface naming and typed rules in central types only
      files: [
        'src/types/**/*.ts'
      ],
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'interface',
            format: ['PascalCase'],
            custom: { regex: '^I[A-Z].*$', match: true }
          },
          {
            selector: 'typeAlias',
            format: ['PascalCase']
          },
          {
            selector: 'typeParameter',
            format: ['PascalCase', 'UPPER_CASE'],
            custom: { regex: '^(T([A-Z][a-zA-Z0-9]+)?|[A-Z])$', match: true }
          }
        ],
        '@typescript-eslint/prefer-readonly': 'warn',
      }
    },
    {
      // Allow service imports in composables and stores
      files: [
        'src/composables/**/*.{ts,js}',
        'src/stores/**/*.{ts,js}',
        'src/features/**/composables/**/*.{ts,js}',
        'src/features/**/stores/**/*.{ts,js}',
        'src/services/**/*.{ts,js}',
      ],
      rules: {
        'no-restricted-imports': 'off',
        'no-restricted-syntax': 'off',
        'max-lines': ['error', { max: 150, skipComments: true, skipBlankLines: true }],
      },
    },
    {
      // Relax rules for build scripts and config files
      files: [
        'scripts/**/*.{js,mjs,ts}',
        '*.config.{js,cjs,mjs,ts}',
        '*.config.*.{js,cjs,mjs,ts}',
        '.eslintrc.cjs',
      ],
      rules: {
        'no-restricted-syntax': 'off',
        'complexity': 'off',
        'max-depth': 'off',
        'max-lines-per-function': 'off',
        'no-console': 'off',
        'eslint-comments/no-use': 'off',
        'eslint-comments/require-description': 'off',
        'no-warning-comments': 'off',
        'max-lines': 'off',
      },
    },
    {
      // Test-specific overrides - maintain strict bans but allow test patterns
      files: [
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/*.test.{ts,tsx,js,jsx}',
        'tests/**/*.{ts,tsx,js,jsx}'
      ],
      env: {
        node: true,
        'vitest-globals/env': true,
      },
      extends: ['plugin:vitest-globals/recommended'],
      rules: {
        // Allow console in tests for debugging
        'no-console': 'off',
        
        // Allow any in tests for mocks and flexible testing
        '@typescript-eslint/no-explicit-any': 'off',
        
        // Allow unused vars in tests for setup
        '@typescript-eslint/no-unused-vars': 'off',
        
        // Allow service imports in tests
        'no-restricted-imports': 'off',
        'no-restricted-syntax': 'off',
        
        // Keep ts-comment bans even in tests - ban all @ts-* comments
        '@typescript-eslint/ban-ts-comment': ['error', {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-expect-error': true,
          'minimumDescriptionLength': 999 // effectively disallow
        }],
        
        // Keep strict bans even in tests
        'eslint-comments/no-use': ['error', { allow: [] }],
        'eslint-comments/no-unlimited-disable': 'error',
        'eslint-comments/disable-enable-pair': ['error', { allowWholeFile: false }],
        'eslint-comments/no-restricted-disable': 'error',
        'eslint-comments/require-description': 'error',
        'vue/comment-directive': ['error', { reportUnusedDisableDirectives: true }],
        'no-warning-comments': ['error', { terms: ['todo', 'fixme'], location: 'anywhere' }],
        
        // Relax complexity rules for test files
        'max-lines-per-function': 'off',
        'max-nested-callbacks': 'off',
        'max-depth': 'off',
        'max-lines': ['error', { max: 300, skipComments: true, skipBlankLines: true }],
        'complexity': 'off',
        'max-params': 'off',
        
        // Vue test specific
        'vue/multi-word-component-names': 'off',
        'vue/block-lang': 'off',
      },
    },
  ],
};
