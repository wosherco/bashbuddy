import { PostHog } from "posthog-node";

import { env } from "../env";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
export const posthog = new PostHog(env.PUBLIC_POSTHOG_API_KEY ?? "phc_dummy", {
  host: env.PUBLIC_POSTHOG_ENDPOINT,
});

process.on("SIGTERM", () => {
  void posthog.shutdown();
});

process.on("exit", () => {
  void posthog.shutdown();
});
