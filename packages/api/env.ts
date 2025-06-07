import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as dbEnv } from "@bashbuddy/db/env";
import urlsEnv from "@bashbuddy/envs/urls";

export const env = createEnv({
  extends: [dbEnv, urlsEnv],
  server: {
    GROQ_API_KEY: z.string().min(1),

    GOOGLE_VERTEX_AI_CREDENTIALS: z.string(),

    LANGFUSE_SECRET_KEY: z.string().optional(),
    LANGFUSE_PUBLIC_KEY: z.string().optional(),
    LANGFUSE_BASEURL: z.string().optional(),

    JWT_SECRET: z.string().min(1),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.CI !== undefined,
});
