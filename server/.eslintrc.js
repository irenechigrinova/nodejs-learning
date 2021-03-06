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
  plugins: ['@typescript-eslint', 'prettier', 'sql'],
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
    'class-methods-use-this': 'off',
    'linebreak-style': 'off',
    'no-param-reassign': 'off',
    'object-curly-newline': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'sql/format': 'off',
    'sql/no-unsafe-query': 'off',
  },
};
