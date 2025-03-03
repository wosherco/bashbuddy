import type { Cookies } from "@sveltejs/kit";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { dev } from "$app/environment";

import type { Session } from "@bashbuddy/db/schema";
import { SESSION_COOKIE } from "@bashbuddy/auth";
import { db } from "@bashbuddy/db/client";
import { sessionTable } from "@bashbuddy/db/schema";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessionTable).values(session);
  return session;
}

export function setSessionTokenCookie(
  cookies: Cookies,
  token: string,
  expiresAt: Date,
): void {
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: !dev,
    secure: !dev,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
    domain: dev ? undefined : ".bashbuddy.run",
  });
}

export function deleteSessionTokenCookie(cookies: Cookies): void {
  cookies.set(SESSION_COOKIE, "", {
    httpOnly: !dev,
    secure: !dev,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    domain: dev ? undefined : ".bashbuddy.run",
  });
}
