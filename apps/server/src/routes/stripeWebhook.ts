import * as Sentry from "@sentry/bun";
import { Hono } from "hono";

import { handleStripeWebhook } from "@bashbuddy/stripe";

const stripeWebhook = new Hono();

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
    console.error(error, "Request failed");
    return c.status(500);
  }
});

export { stripeWebhook };
