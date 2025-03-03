import "./instrumentation.ts";

import { trpcServer } from "@hono/trpc-server";
import ngrok from "@ngrok/ngrok";
import { Hono } from "hono";
import { pinoLogger } from "hono-pino";
import { cors } from "hono/cors";

import { appRouter, createTRPCContext } from "@bashbuddy/api";
import { validateSessionRequest } from "@bashbuddy/auth";

import { env } from "./env";
import { logger } from "./logger.ts";
import { stripeWebhook } from "./routes/stripeWebhook";

const app = new Hono();

app.use(
  "*",
  pinoLogger({
    pino: logger,
  }),
);

if (env.PUBLIC_ENVIRONMENT === "development") {
  app.use(
    "*",
    cors({
      origin: [
        env.PUBLIC_ACCOUNT_URL,
        env.PUBLIC_LANDING_URL,
        env.PUBLIC_AUTHENTICATOR_URL,
      ],
      credentials: true,
    }),
  );
}

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    async createContext(opts, _) {
      const { user, session } = await validateSessionRequest(opts.req.headers);

      return createTRPCContext({
        headers: opts.req.headers,
        user,
        session,
      });
    },
    router: appRouter,
  }),
);

// Mount PowerSync routes
app.route("/webhooks/stripe", stripeWebhook);

const port = process.env.PORT ?? 3000;

if (env.NGROK_ENABLED) {
  ngrok
    .connect({
      authtoken: env.NGROK_AUTHTOKEN,
      addr: port,
      domain: env.NGROK_URL,
    })
    .then((listener) => {
      logger.info(`Ngrok listening on ${listener.url()}`);
    })
    .catch((err) => {
      logger.error("Failed to connect to ngrok", err);
    });
}

export default {
  fetch: app.fetch,
  port,
};
