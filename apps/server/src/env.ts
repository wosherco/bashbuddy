import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as apiEnv } from "@bashbuddy/api/env";
import ngrokEnv from "@bashbuddy/envs/ngrok";
import { env as stripeEnv } from "@bashbuddy/stripe/env";

export const env = createEnv({
  extends: [apiEnv, ngrokEnv, stripeEnv],
  server: {
    API_SENTRY_DSN: z.string().optional(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.CI !== undefined,
});
