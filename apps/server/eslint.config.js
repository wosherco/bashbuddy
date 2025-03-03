import ts from "typescript-eslint";

import baseConfig from "@bashbuddy/eslint-config/base";

export default ts.config(
  {
    ignores: ["dist/"],
  },
  ...baseConfig,
);
