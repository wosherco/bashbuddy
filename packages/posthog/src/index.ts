import { PostHog } from "posthog-node";

import { env } from "../env";

export const posthog = new PostHog(env.PUBLIC_POSTHOG_API_KEY, {
  host: env.PUBLIC_POSTHOG_ENDPOINT,
});

process.on("SIGTERM", async () => {
  await posthog.shutdown();
});

process.on("exit", async () => {
  await posthog.shutdown();
});
