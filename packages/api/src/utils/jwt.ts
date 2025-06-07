import * as jose from "jose";
import { z } from "zod";

import { env } from "../../env";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export const ChatTokenPayloadSchema = z.object({
  userId: z.string(),
  chatId: z.string(),
});

export type ChatTokenPayload = z.infer<typeof ChatTokenPayloadSchema>;

interface TokenParameters {
  /**
   * Set the "exp" (Expiration Time) Claim.
   *
   * - If a `number` is passed as an argument it is used as the claim directly.
   * - If a `Date` instance is passed as an argument it is converted to unix timestamp and used as the
   *   claim.
   * - If a `string` is passed as an argument it is resolved to a time span, and then added to the
   *   current unix timestamp and used as the claim.
   *
   * Format used for time span should be a number followed by a unit, such as "5 minutes" or "1
   * day".
   *
   * Valid units are: "sec", "secs", "second", "seconds", "s", "minute", "minutes", "min", "mins",
   * "m", "hour", "hours", "hr", "hrs", "h", "day", "days", "d", "week", "weeks", "w", "year",
   * "years", "yr", "yrs", and "y". It is not possible to specify months. 365.25 days is used as an
   * alias for a year.
   *
   * If the string is suffixed with "ago", or prefixed with a "-", the resulting time span gets
   * subtracted from the current unix timestamp. A "from now" suffix can also be used for
   * readability when adding to the current unix timestamp.
   *
   * @param input "exp" (Expiration Time) Claim value to set on the JWT Claims Set.
   */
  expiresIn: number | string | Date;
}

async function createToken<T extends jose.JWTPayload>(
  payload: T,
  parameters: Partial<TokenParameters> = {},
) {
  const jwt = new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" }) // Algorithm to be used
    .setIssuedAt(); // Set issued at time
  if (parameters.expiresIn) {
    jwt.setExpirationTime(parameters.expiresIn);
  }

  return await jwt.sign(secret);
}

export class InvalidTokenPayloadContents extends Error {
  constructor() {
    super("Invalid token payload contents");
    this.name = "InvalidTokenPayloadContents";
  }
}

async function verifyToken<T>(schema: z.ZodSchema<T>, token: string) {
  const { payload } = await jose.jwtVerify<T>(token, secret);

  const parsedPayload = await schema.safeParseAsync(payload);

  if (!parsedPayload.success) {
    throw new InvalidTokenPayloadContents();
  }

  return payload;
}

export async function createChatToken(
  payload: ChatTokenPayload,
  parameters?: Partial<TokenParameters>,
) {
  return await createToken(payload, parameters);
}

export async function verifyChatToken(token: string) {
  return await verifyToken(ChatTokenPayloadSchema, token);
}
