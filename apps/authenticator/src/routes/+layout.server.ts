import { deleteSessionTokenCookie } from "@/server/auth";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ locals, url, cookies }) => {
  const loggedIn = locals.auth.session !== null;
  if (!loggedIn) {
    deleteSessionTokenCookie(cookies);
  }

  return {
    user:
      locals.auth.session !== null
        ? {
            name: locals.auth.user.name,
            image: locals.auth.user.profilePicture,
          }
        : null,
    redirectTo: url.searchParams.get("redirectTo"),
  };
};
