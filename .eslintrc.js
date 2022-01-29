module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    'cypress/globals': true,
  },
  extends: [
    'plugin:cypress/recommended',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-app/recommended',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
  ],
  settings: {
    react: {
      version: 'latest',
    },
  },
  rules: {
    'react-app/jsx-a11y/anchor-is-valid': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/camelcase': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'no-trailing-spaces': ['error', { skipBlankLines: true }],
    'no-console': 'off',
    '@typescript-eslint/no-unused-vars': [2, { args: 'none' }],
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'off',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
  },
};
