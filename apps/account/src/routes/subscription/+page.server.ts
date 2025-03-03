import { fail, redirect } from "@sveltejs/kit";

import { createCheckoutSession, createCustomerSession } from "@bashbuddy/stripe";

import type { Actions } from "./$types";

export const actions = {
  customerSession: async (event) => {
    if (!event.locals.stripeEnabled) {
      return fail(404, { error: "Stripe is not enabled" });
    }

    const userId = event.locals.auth.user.id;

    const session = await createCustomerSession(userId);

    if (!session) {
      return fail(500, { error: "Failed to create customer session" });
    }

    return redirect(301, session.url);
  },
  customerCheckout: async (event) => {
    if (!event.locals.stripeEnabled) {
      return fail(404, { error: "Stripe is not enabled" });
    }

    const userId = event.locals.auth.user.id;

    const session = await createCheckoutSession(userId);

    if (!session?.url) {
      return fail(500, { error: "Failed to create checkout session" });
    }

    return redirect(301, session.url);
  },
} satisfies Actions;
