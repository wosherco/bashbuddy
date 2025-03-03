/// <reference types="./types.d.ts" />

import svelte from "eslint-plugin-svelte";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    files: ["**/*.svelte"],
    extends: [
      ...svelte.configs["flat/recommended"],
      ...svelte.configs["flat/prettier"],
    ],
    rules: {},
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.svelte"],

    languageOptions: {
      parserOptions: {
        extraFileExtensions: [".svelte"],
        parser: tseslint.parser,
      },
    },
  },
);
