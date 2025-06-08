import type { Handle } from "@sveltejs/kit";
import * as Sentry from "@sentry/sveltekit";
import { sequence } from "@sveltejs/kit/hooks";
import { env } from "$env/dynamic/public";
import { PUBLIC_AUTHENTICATOR_SENTRY_DSN } from "$env/static/public";

import { validateSessionRequest } from "@bashbuddy/auth";

Sentry.init({
  dsn: PUBLIC_AUTHENTICATOR_SENTRY_DSN,
  environment: env.PUBLIC_ENVIRONMENT,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  _experiments: { enableLogs: true },
  integrations: [
    // send console.log, console.error, and console.warn calls as logs to Sentry
    Sentry.consoleLoggingIntegration({
      levels: ["log", "info", "error", "warn"],
    }),
  ],
});

if (env.PUBLIC_ENVIRONMENT === "development") {
  Sentry.init({});
}

const handleAuth: Handle = async ({ event, resolve }) => {
  const session = await validateSessionRequest(event.request.headers);
  event.locals.auth = session;

  return resolve(event);
};

export const handle = sequence(Sentry.sentryHandle(), handleAuth);
