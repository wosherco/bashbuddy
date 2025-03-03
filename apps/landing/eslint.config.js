import ts from "typescript-eslint";

import baseConfig from "@bashbuddy/eslint-config/base";
import svelteConfig from "@bashbuddy/eslint-config/svelte";

export default ts.config(
  {
    ignores: ["build/", ".svelte-kit/", "dist/"],
  },
  ...baseConfig,
  ...svelteConfig,
);
