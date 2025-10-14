module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "@google/eslint-config/recommended",
  ],
  rules: {
    "quotes": ["error", "single"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
  },
};