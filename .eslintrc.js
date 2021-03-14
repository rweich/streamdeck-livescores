module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/member-ordering': [
      'error',
      {
        "default": [
          "signature",
          "abstract-field",
          "static-field",
          "instance-field",
          "constructor",
          "abstract-method",
          "static-method",
          "instance-method",
        ]
      }
    ]
  },
};
