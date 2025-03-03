import * as Sentry from "@sentry/bun";
import { Hono } from "hono";
import { pinoLogger } from "hono-pino";

import { handleStripeWebhook } from "@bashbuddy/stripe";

import { logger } from "../logger";

const stripeWebhook = new Hono().use(
  "*",
  pinoLogger({
    pino: logger.child({
      subrouter: "stripeWebhook",
    }),
  }),
);

stripeWebhook.post("/", async (c) => {
  try {
    const res = await handleStripeWebhook(c.req.raw);
    return res;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        webhook: "stripe",
      },
    });
    c.var.logger.error(error, "Request failed");
    return c.status(500);
  }
});

export { stripeWebhook };
