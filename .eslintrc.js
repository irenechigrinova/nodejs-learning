module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'prettier/prettier': 'error',
    'operator-linebreak': 'off',
    'implicit-arrow-linebreak': 'off',
    'comma-dangle': 'off',
    'function-paren-newline': 'off',
    'no-shadow': 'off',
    'no-unused-vars': 'off',
    'arrow-parens': 'off',
    'no-confusing-arrow': 'off',
    'consistent-return': 'off',
    'import/no-import-module-exports': 'off',
    'import/extensions': 'off',
    'newline-per-chained-call': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
};
