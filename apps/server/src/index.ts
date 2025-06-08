// import "./instrumentation.ts";

import type { ServerWebSocket } from "bun";
import { trpcServer } from "@hono/trpc-server";
import ngrok from "@ngrok/ngrok";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { cors } from "hono/cors";
import PQueue from "p-queue";

import type { ChatTokenPayload } from "@bashbuddy/api/utils/jwt";
import { C2S_AgentMessageSchema } from "@bashbuddy/agent/transport";
import { appRouter, createTRPCContext } from "@bashbuddy/api";
import { ClientTransporterHandler } from "@bashbuddy/api/logic";
import { verifyChatToken } from "@bashbuddy/api/utils/jwt";
import { validateSessionRequest } from "@bashbuddy/auth";

import { env } from "./env";
import { stripeWebhook } from "./routes/stripeWebhook";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono();

if (env.PUBLIC_ENVIRONMENT === "development") {
  app.use(
    "*",
    cors({
      origin: [
        env.PUBLIC_ACCOUNT_URL,
        env.PUBLIC_LANDING_URL,
        env.PUBLIC_AUTHENTICATOR_URL,
      ],
      credentials: true,
    }),
  );
}

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    async createContext(opts, _) {
      const { user, session } = await validateSessionRequest(opts.req.headers);

      return createTRPCContext({
        headers: opts.req.headers,
        user,
        session,
      });
    },
    router: appRouter,
  }),
);

// Mount PowerSync routes
app.route("/webhooks/stripe", stripeWebhook);

app.get("/health", (c) =>
  c.json({ status: "Healthy! What are you doing here?" }),
);

const port = process.env.PORT ?? 3000;

if (env.NGROK_ENABLED) {
  ngrok
    .connect({
      authtoken: env.NGROK_AUTHTOKEN,
      addr: port,
      domain: env.NGROK_URL,
    })
    .then((listener) => {
      console.info(`Ngrok listening on ${listener.url()}`);
    })
    .catch((err) => {
      console.error("Failed to connect to ngrok", err);
    });
}

app.get(
  "/v2/ws",
  async (c, next) => {
    const token = c.req.query("token");

    if (!token) {
      return c.json({ error: "No token provided" }, 401);
    }

    try {
      const chatDetails = await verifyChatToken(token);

      console.log("chatDetails", chatDetails);

      // @ts-expect-error - TODO: Fix this
      c.set("chatDetails", chatDetails);
    } catch {
      return c.json({ error: "Invalid token" }, 401);
    }

    await next();
  },
  upgradeWebSocket((c) => {
    const chatDetails = c.get("chatDetails") as ChatTokenPayload;

    let transporter: ClientTransporterHandler;
    const messageQueue = new PQueue({ concurrency: 1 });

    return {
      onOpen(evt, ws) {
        transporter = new ClientTransporterHandler(chatDetails, ws);
      },
      async onMessage(event) {
        await messageQueue.add(async () => {
          if (typeof event.data !== "string") {
            return;
          }

          try {
            const parsedMessage = await C2S_AgentMessageSchema.safeParseAsync(
              JSON.parse(event.data),
            );

            if (parsedMessage.success) {
              console.log("onMessage", parsedMessage.data);
              await transporter.onMessage(parsedMessage.data);
            }
          } catch (e) {
            console.error("Error parsing message", e);
          }
        });
      },
      onError: (event) => {
        console.error("Error", event);
        transporter?.stop();
      },
      onClose: () => {
        transporter?.stop();
        console.log("Connection closed");
      },
    };
  }),
);

export default {
  fetch: app.fetch,
  port,
  websocket,
};
