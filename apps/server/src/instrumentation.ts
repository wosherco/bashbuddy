import * as Sentry from "@sentry/bun";

import { env } from "./env";

Sentry.init({
  dsn: env.API_SENTRY_DSN,
  environment: env.PUBLIC_ENVIRONMENT,
  // Tracing
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  _experiments: { enableLogs: true },
  integrations: [
    // send console.log, console.error, and console.warn calls as logs to Sentry
    Sentry.consoleLoggingIntegration({
      levels: ["log", "error", "warn", "info"],
    }),
  ],
});

if (env.PUBLIC_ENVIRONMENT === "development") {
  Sentry.init({});
}
