import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as baseEnv } from "@bashbuddy/envs";

export const env = createEnv({
  extends: [baseEnv],
  server: {
    POSTGRES_URL: z.string().min(1),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.CI !== undefined,
});
