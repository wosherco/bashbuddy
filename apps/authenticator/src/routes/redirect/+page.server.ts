/* eslint-disable @typescript-eslint/only-throw-error */
import { getRedirectCookie } from "@/cookies";
import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";

import { getTokenFromRequest } from "@bashbuddy/auth";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = ({ cookies, request, url }) => {
  const redirectTo =
    url.searchParams.get("redirectTo") ?? getRedirectCookie(cookies);

  if (redirectTo === "cli") {
    const token = getTokenFromRequest(request.headers);
    if (token !== null) {
      throw redirect(302, `/cli`);
    }
  }

  throw redirect(302, env.PUBLIC_ACCOUNT_URL);
};
