import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { db } from "@bashbuddy/db/client";
import { chatTable } from "@bashbuddy/db/schema";
import { posthog } from "@bashbuddy/posthog";

import { env } from "../../../env";
import { subscribedProcedure } from "../../trpc";
import { createChatToken } from "../../utils/jwt";

export const v2ChatRouter = {
  createChatSession: subscribedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.completionsUsedThisMonth >= 400) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "You've reached the maximum of 400 completions this month. Contact us to increase this limit.",
      });
    }

    const [chat] = await db
      .insert(chatTable)
      .values({
        userId: ctx.user.id,
      })
      .returning();

    if (!chat) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create chat session",
      });
    }

    posthog.capture({
      distinctId: ctx.user.id,
      event: "chat.create",
      properties: {
        chatId: chat.id,
        isV2: true,
      },
    });

    const jwt = await createChatToken({
      chatId: chat.id,
      userId: ctx.user.id,
    });

    return {
      chatId: chat.id,
      url: `${env.PUBLIC_API_URL.replace("http://", "ws://").replace("https://", "wss://")}/v2/ws?token=${jwt}`,
    };
  }),
} satisfies TRPCRouterRecord;
