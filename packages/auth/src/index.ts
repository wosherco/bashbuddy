import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";

import type { Session, User } from "@bashbuddy/db/schema";
import { eq } from "@bashbuddy/db";
import { db } from "@bashbuddy/db/client";
import { sessionTable, userTable } from "@bashbuddy/db/schema";

export const SESSION_COOKIE = "acc_session_token";

export async function validateSessionRequest(
  headers: Headers,
): Promise<SessionValidationResult> {
  const token = getTokenFromRequest(headers);

  if (token === null) {
    return { session: null, user: null };
  }

  return validateSessionToken(token);
}

export function getTokenFromRequest(headers: Headers): string | null {
  // Trying to get from cookie from the headers, and then the SESSION_COOKIE cookie
  let token =
    headers
      .get("Cookie")
      ?.split("; ")
      .find((row) => row.startsWith(`${SESSION_COOKIE}=`))
      ?.split("=")[1] ?? null;

  if (token === null) {
    // Trying to get from Authorization header
    token = headers.get("Authorization")?.split(" ")[1] ?? null;
  }

  return token;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const [result] = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));

  if (result === undefined) {
    return { session: null, user: null };
  }

  const { user, session } = result;

  // Session has expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }

  // Session is about to expire, refresh it
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
