import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const runtimeEnv =
  typeof process === "undefined" ? import.meta.env : process.env;

export const skipValidation =
  typeof process === "undefined" || process.env.CI !== undefined;

export const env = createEnv({
  server: {},
  shared: {
    /**
     * @deprecated Use PUBLIC_ENVIRONMENT instead
     */
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PUBLIC_ENVIRONMENT: z
      .enum(["development", "production", "test", "staging"])
      .default("development"),
  },
  runtimeEnv,
  skipValidation,
});
