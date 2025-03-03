import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as baseEnv, runtimeEnv, skipValidation } from "@bashbuddy/envs";

export const env = createEnv({
  extends: [baseEnv],
  server: {
    LOG_LEVEL: z
      .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
      .default("info")
      .optional(),
  },
  runtimeEnv,
  skipValidation,
});
