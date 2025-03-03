import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const ngrokEnv = createEnv({
  server: {
    NGROK_AUTHTOKEN: z.string().optional(),
    NGROK_URL: z.string().optional(),
    NGROK_ENABLED: z.coerce.boolean().default(false),
  },
  runtimeEnv: process.env,
  skipValidation: process.env.CI !== undefined,
});

export default ngrokEnv;
