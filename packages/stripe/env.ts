import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import urlsEnv from "@bashbuddy/envs/urls";

export const env = createEnv({
  extends: [urlsEnv],
  server: {
    PUBLIC_STRIPE_ENABLED: z.coerce.boolean().default(false),
    STRIPE_PUBLIC_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
  },
  runtimeEnv: process.env,
  skipValidation: true,
});
