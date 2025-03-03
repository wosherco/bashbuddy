import { createEnv } from "@t3-oss/env-core";

import { env as dbEnv } from "@bashbuddy/db/env";

export const env = createEnv({
  extends: [dbEnv],
  server: {},
  runtimeEnv: process.env,
  skipValidation: process.env.CI !== undefined,
});
