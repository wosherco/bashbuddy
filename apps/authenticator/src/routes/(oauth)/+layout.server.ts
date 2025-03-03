import { setAuthSessionCookie, setRedirectCookie } from "@/cookies";
import { redirect } from "@sveltejs/kit";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals, cookies, url }) => {
  setRedirectCookie(cookies, url.searchParams.get("redirectTo"));
  setAuthSessionCookie(cookies, url.searchParams.get("authSession") ?? "");

  if (locals.auth.session !== null) {
    return redirect(302, "/redirect");
  }

  return {};
};
