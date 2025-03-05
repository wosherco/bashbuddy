import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PUBLIC_POSTHOG_ENDPOINT: z.string().min(1),
    PUBLIC_POSTHOG_API_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
  skipValidation: true,
});
