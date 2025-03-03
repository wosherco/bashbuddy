import * as Sentry from "@sentry/sveltekit";
import { handleErrorWithSentry } from "@sentry/sveltekit";
import {
  PUBLIC_ENVIRONMENT,
  PUBLIC_LANDING_SENTRY_DSN,
} from "$env/static/public";

Sentry.init({
  dsn: PUBLIC_LANDING_SENTRY_DSN,
  environment: PUBLIC_ENVIRONMENT,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  // Optional: Initialize Session Replay:
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

if (PUBLIC_ENVIRONMENT === "development") {
  Sentry.init({});
}

export const handleError = handleErrorWithSentry();
