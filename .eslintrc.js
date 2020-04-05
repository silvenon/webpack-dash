module.exports = {
  parserOptions: {
    // for async/await
    ecmaVersion: 8,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    es6: true,
    node: true,
  },
}
