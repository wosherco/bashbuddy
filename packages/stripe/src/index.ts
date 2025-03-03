import * as Sentry from "@sentry/bun";
import Stripe from "stripe";

import { eq } from "@bashbuddy/db";
import { db } from "@bashbuddy/db/client";
import { paymentTable, userTable } from "@bashbuddy/db/schema";

import { env } from "../env";

function createStripe() {
  if (!env.PUBLIC_STRIPE_ENABLED) {
    return null;
  }

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  return new Stripe(env.STRIPE_SECRET_KEY);
}

async function ensureCustomerId(stripe: Stripe, userId: string) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select({
        id: userTable.id,
        name: userTable.name,
        stripeCustomerId: userTable.stripeCustomerId,
        email: userTable.email,
      })
      .from(userTable)
      .where(eq(userTable.id, userId));

    if (!user) {
      throw new Error("User not found");
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });

      try {
        await tx
          .update(userTable)
          .set({ stripeCustomerId: customer.id })
          .where(eq(userTable.id, userId));
      } catch (err) {
        await stripe.customers.del(customer.id);
        throw err;
      }

      customerId = customer.id;
    }

    return customerId;
  });
}

export async function createCheckoutSession(userId: string) {
  const stripe = createStripe();

  if (!stripe) {
    return null;
  }

  const customerId = await ensureCustomerId(stripe, userId);

  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: "price_1QxbUQRJ9x8LyhxTPSntQtcy",
        quantity: 1,
      },
    ],
    customer: customerId,
    // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
    // the actual Session ID is returned in the query parameter when your customer
    // is redirected to the success page.
    success_url: `${env.PUBLIC_ACCOUNT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.PUBLIC_ACCOUNT_URL}/subscription/canceled`,
  });
}

export async function createCustomerSession(userId: string) {
  const stripe = createStripe();

  if (!stripe) {
    return null;
  }

  const customerId = await ensureCustomerId(stripe, userId);

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${env.PUBLIC_ACCOUNT_URL}/subscription`,
  });
}

export async function handleStripeWebhook(req: Request): Promise<Response> {
  const stripe = createStripe();

  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe is not enabled", { status: 403 });
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("stripe-signature is not set", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        webhook: "stripe",
      },
    });
    console.error(err);
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  // TODO: Add posthog events
  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      if (!session.customer || !session.subscription) {
        // TODO: Handle with sentry
        return new Response("Invalid customer or subscription", {
          status: 400,
        });
      }

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer.id;
      const subscription =
        typeof session.subscription === "string"
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;

      const subscriptionEnd = new Date(subscription.current_period_end * 1000);

      const [user] = await db
        .update(userTable)
        .set({
          subscriptionId: subscription.id,
          subscribedUntil: subscriptionEnd,
        })
        .where(eq(userTable.stripeCustomerId, customerId))
        .returning({
          id: userTable.id,
        });

      if (!user) {
        return new Response("User not found", { status: 404 });
      }

      await db.insert(paymentTable).values({
        userId: user.id,
        amount: session.amount_total ?? -1,
      });

      return new Response("Payment succeeded", { status: 200 });
    }
    case "invoice.paid": {
      const invoice = event.data.object;

      if (!invoice.customer || !invoice.subscription) {
        // TODO: Handle with sentry
        return new Response("Invalid customer or subscription", {
          status: 400,
        });
      }

      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer.id;
      const subscription =
        typeof invoice.subscription === "string"
          ? await stripe.subscriptions.retrieve(invoice.subscription)
          : invoice.subscription;

      const subscriptionEnd = new Date(subscription.current_period_end * 1000);

      await db
        .update(userTable)
        .set({
          subscribedUntil: subscriptionEnd,
        })
        .where(eq(userTable.stripeCustomerId, customerId));

      return new Response("Payment succeeded", { status: 200 });
    }
    case "invoice.payment_failed":
      // TODO: Notify user
      return new Response("Payment failed", { status: 200 });
    default:
      return new Response("Unhandled event type", { status: 200 });
  }
}
