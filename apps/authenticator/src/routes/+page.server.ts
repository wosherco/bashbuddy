import {
  clearAuthCookies,
  setAuthSessionCookie,
  setRedirectCookie,
} from "@/cookies";
import { deleteSessionTokenCookie } from "@/server/auth";
import { fail } from "@sveltejs/kit";

import { invalidateSession } from "@bashbuddy/auth";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ cookies, url }) => {
  setRedirectCookie(cookies, url.searchParams.get("redirectTo"));
  setAuthSessionCookie(cookies, url.searchParams.get("authSession") ?? "");
};

export const actions: Actions = {
  default: async (event) => {
    if (event.locals.auth.session === null) {
      return fail(401);
    }
    await invalidateSession(event.locals.auth.session.id);
    deleteSessionTokenCookie(event.cookies);
    clearAuthCookies(event.cookies);
    return null; // Invalidate the current page without redirecting
  },
};
