import { createSocketless } from "socketless.ws/server";

import type { SocketlessMessage } from "@bashbuddy/validators";

import { env } from "../env";

export const socketless = createSocketless<string, SocketlessMessage>({
  clientId: env.SOCKETLESS_CLIENT_ID,
  token: env.SOCKETLESS_TOKEN,

  // TODO: Needs fixing
  // messageValidator: socketlessMessageSchema,
});
