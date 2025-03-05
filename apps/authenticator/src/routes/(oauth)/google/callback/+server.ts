import type { RequestEvent } from "@sveltejs/kit";
import type { OAuth2Tokens } from "arctic";
import { logger } from "@/logger";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/server/auth";
import { google } from "@/server/providers";
import { decodeIdToken } from "arctic";

import { and, eq } from "@bashbuddy/db";
import { db } from "@bashbuddy/db/client";
import { accountTable, userTable } from "@bashbuddy/db/schema";
import { posthog } from "@bashbuddy/posthog";

export async function GET(event: RequestEvent): Promise<Response> {
  const code = event.url.searchParams.get("code");
  const state = event.url.searchParams.get("state");
  const storedState = event.cookies.get("google_oauth_state") ?? null;
  const codeVerifier = event.cookies.get("google_code_verifier") ?? null;

  if (
    code === null ||
    state === null ||
    storedState === null ||
    codeVerifier === null
  ) {
    return new Response("Missing required parameters.", {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response("State mismatch.", {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch (e) {
    logger.error(e);

    // Invalid code or client credentials
    return new Response("Invalid code or client credentials.", {
      status: 400,
    });
  }

  // https://developers.google.com/identity/gsi/web/guides/verify-google-id-token#using-a-google-api-client-library
  const claims = decodeIdToken(tokens.idToken()) as {
    sub: string;
    name: string;
    picture: string;
    family_name: string;
    given_name: string;
    email: string;
    email_verified: boolean;
  };

  const googleUserId = claims.sub;

  const [existingUser] = await db
    .select()
    .from(accountTable)
    .where(
      and(
        eq(accountTable.platform, "GOOGLE"),
        eq(accountTable.platformId, googleUserId),
      ),
    );

  if (existingUser !== undefined) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.userId);
    setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/redirect",
      },
    });
  }

  const user = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(userTable)
      .values({
        email: claims.email,
        name: `${claims.given_name} ${claims.family_name}`,
        profilePicture: claims.picture,
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create user");
    }

    await tx.insert(accountTable).values({
      platform: "GOOGLE",
      platformId: googleUserId,
      userId: user.id,
    });

    return user;
  });

  posthog.identify({
    distinctId: user.id,
    properties: {
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      platform: "GOOGLE",
    },
  });
  posthog.capture({
    distinctId: user.id,
    event: "create user",
    properties: {
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      platform: "GOOGLE",
    },
  });

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionTokenCookie(event.cookies, sessionToken, session.expiresAt);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/redirect",
    },
  });
}
