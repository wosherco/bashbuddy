import "@bashbuddy/opentelemetry";

import * as Sentry from "@sentry/bun";

import { env } from "./env";

Sentry.init({
  dsn: env.API_SENTRY_DSN,
  environment: env.PUBLIC_ENVIRONMENT,
  // Tracing
  tracesSampleRate: 1.0, // Capture 100% of the transactions
});

if (env.PUBLIC_ENVIRONMENT === "development") {
  Sentry.init({});
}
