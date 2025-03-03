import ts from "typescript-eslint";

import baseConfig from "@bashbuddy/eslint-config/base";
import reactConfig from "@bashbuddy/eslint-config/react";

export default ts.config(
  {
    ignores: ["dist/"],
  },
  ...baseConfig,
  ...reactConfig,
);
