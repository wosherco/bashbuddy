import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as baseEnv } from "@bashbuddy/envs";

export const env = createEnv({
  extends: [baseEnv],
  server: {
    AXIOM_API_TOKEN: z.string(),
    AXIOM_DATASET: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.CI !== undefined,
});
