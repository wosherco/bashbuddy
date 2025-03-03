import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals }) => {
  return {
    user: locals.auth.user,
    subscribed: locals.subscribed,
    stripeEnabled: locals.stripeEnabled,
  };
};
