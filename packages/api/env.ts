import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as dbEnv } from "@bashbuddy/db/env";

export const env = createEnv({
  extends: [dbEnv],
  server: {
    GROQ_API_KEY: z.string().min(1),

    LANGFUSE_SECRET_KEY: z.string().optional(),
    LANGFUSE_PUBLIC_KEY: z.string().optional(),
    LANGFUSE_BASEURL: z.string().optional(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.CI !== undefined,
});
