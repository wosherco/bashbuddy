import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  extends: [],
  server: {
    SOCKETLESS_CLIENT_ID: z.string(),
    SOCKETLESS_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: true,
});
