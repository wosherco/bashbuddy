import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    REDIS_URL: z.string().min(1),
    REDIS_TOKEN: z.string().min(1),
  },
  runtimeEnv: process.env,
  skipValidation: true,
});
