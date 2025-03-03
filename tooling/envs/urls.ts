import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const urlsEnv = createEnv({
  server: {
    PUBLIC_ACCOUNT_URL: z.string().min(1),
    PUBLIC_API_URL: z.string().min(1),
    PUBLIC_AUTHENTICATOR_URL: z.string().min(1),
    PUBLIC_LANDING_URL: z.string().min(1),
  },
  shared: {},
  runtimeEnv: process.env,
  skipValidation: process.env.CI !== undefined,
});

export default urlsEnv;
