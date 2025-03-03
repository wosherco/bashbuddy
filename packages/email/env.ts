import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as sharedEnv } from "@bashbuddy/envs";
import urlsEnv from "@bashbuddy/envs/urls";

export const env = createEnv({
  extends: [sharedEnv, urlsEnv],
  server: {
    SMTP_EMAIL_HOST: z.string().min(1),
    SMTP_EMAIL_PORT: z.number(),
    SMTP_EMAIL_ADDRESS: z.string().optional(),
    SMTP_EMAIL_PASSWORD: z.string().optional(),
    SMTP_SENDFROM: z.string().min(1),
  },
  runtimeEnv: process.env,
  skipValidation: true,
});
