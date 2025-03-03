import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  extends: [],
  server: {},
  runtimeEnv: process.env,
  skipValidation: process.env.CI !== undefined,
});
