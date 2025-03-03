/* eslint-disable @typescript-eslint/only-throw-error */
import { getAuthSessionCookie } from "@/cookies";
import { notifyAuthSessionCreated } from "@/server/authSessions";
import { redirect } from "@sveltejs/kit";

import { getTokenFromRequest } from "@bashbuddy/auth";
import { eq } from "@bashbuddy/db";
import { db } from "@bashbuddy/db/client";
import { authSessionTable } from "@bashbuddy/db/schema";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request, cookies }) => {
  const token = getTokenFromRequest(request.headers);

  if (!token) {
    throw redirect(302, "/");
  }

  const authSession = getAuthSessionCookie(cookies);

  if (authSession) {
    const [dbAuthSession] = await db
      .select()
      .from(authSessionTable)
      .where(eq(authSessionTable.id, authSession));

    console.log(authSession, dbAuthSession);

    if (dbAuthSession) {
      if (dbAuthSession.expiresAt.getTime() > Date.now()) {
        await notifyAuthSessionCreated(dbAuthSession.id, token);
      }

      await db
        .delete(authSessionTable)
        .where(eq(authSessionTable.id, authSession));
    }
  }

  return {
    token,
  };
};
