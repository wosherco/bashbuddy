import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { Groq } from "groq-sdk";
import { Langfuse } from "langfuse";
import { z } from "zod";

import type { LLM } from "@bashbuddy/agent";
import { processPrompt } from "@bashbuddy/agent";
import { eq, increment } from "@bashbuddy/db";
import { db } from "@bashbuddy/db/client";
import { userTable } from "@bashbuddy/db/schema";
import { posthog } from "@bashbuddy/posthog";
import {
  addMessageToChatSession,
  createChatSession,
  getChatSession,
} from "@bashbuddy/redis";
import { createRatelimit, Ratelimit } from "@bashbuddy/redis/ratelimit";
import { contextSchema } from "@bashbuddy/validators";

import { env } from "../../env";
import { subscribedProcedure } from "../trpc";

const langfuse =
  env.LANGFUSE_BASEURL &&
  env.LANGFUSE_SECRET_KEY &&
  env.LANGFUSE_PUBLIC_KEY &&
  // * Not tracking on prod :D
  env.PUBLIC_ENVIRONMENT === "development"
    ? new Langfuse({
        secretKey: env.LANGFUSE_SECRET_KEY,
        publicKey: env.LANGFUSE_PUBLIC_KEY,
        baseUrl: env.LANGFUSE_BASEURL,
      })
    : undefined;

class GroqLLM implements LLM {
  private groq: Groq;
  private messages: Groq.Chat.Completions.ChatCompletionMessageParam[];
  private chatId: string;
  private userId: string;

  constructor(
    messages: Groq.Chat.Completions.ChatCompletionMessageParam[],
    chatId: string,
    userId: string,
  ) {
    this.groq = new Groq();
    this.messages = messages;
    this.chatId = chatId;
    this.userId = userId;
  }

  async *infer(systemPrompt: string, prompt: string): AsyncIterable<string> {
    const trace = langfuse?.trace({
      name: "chat.ask",
      id: this.chatId,
      userId: this.userId,
    });

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...this.messages,
      {
        role: "user",
        content: prompt,
      },
    ];

    const temperature = 0.7;
    const maxCompletionTokens = 1024;
    const topP = 1;

    const generation = trace?.generation({
      name: "chat.ask",
      model: "llama-3.1-8b-instant",
      input: messages,
      modelParameters: {
        temperature,
        max_completion_tokens: maxCompletionTokens,
        topP,
      },
    });

    const chatCompletion = await this.groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
      temperature,
      max_completion_tokens: maxCompletionTokens,
      top_p: topP,
      stream: true,
      stop: null,
    });

    let content = "";

    for await (const chunk of chatCompletion) {
      content += chunk.choices[0]?.delta?.content ?? "";
      yield chunk.choices[0]?.delta?.content ?? "";
    }

    generation?.end({
      output: content,
    });
  }
}

const createChatRatelimit = createRatelimit(
  "chat.create",
  Ratelimit.slidingWindow(10, "10s"),
);

const askRatelimit = createRatelimit(
  "chat.ask",
  Ratelimit.slidingWindow(500, "1d"),
);

export const chatRouter = {
  createChat: subscribedProcedure.mutation(async ({ ctx }) => {
    const rl = await createChatRatelimit.limit(ctx.user.id);

    if (!rl.success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests. Please try again later.",
      });
    }

    const chatId = await createChatSession(ctx.user.id);

    posthog.capture({
      distinctId: ctx.user.id,
      event: "chat.create",
      properties: {
        chatId,
      },
    });

    return chatId;
  }),

  ask: subscribedProcedure
    .input(
      z.object({
        input: z.string(),
        context: contextSchema,
        chatId: z.string(),
        useYaml: z.boolean().optional().default(false),
      }),
    )
    .mutation(async function* ({ ctx, input }) {
      if (ctx.user.completionsUsedThisMonth >= 5000) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You've reached the maximum of 5000 completions this month. Contact us to increase this limit.",
        });
      }

      const rl = await askRatelimit.limit(ctx.user.id);

      if (!rl.success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }

      const chatSession = await getChatSession(input.chatId);

      if (chatSession.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat not found.",
        });
      }

      if (chatSession.messages.length > 10) {
        throw new TRPCError({
          code: "PAYLOAD_TOO_LARGE",
          message: "Chat is too long. Please start a new chat.",
        });
      }

      posthog.capture({
        distinctId: ctx.user.id,
        event: "chat.ask",
        properties: {
          chatId: input.chatId,
        },
      });

      const incrementNumberPromise = db
        .update(userTable)
        .set({
          completionsUsedThisMonth: increment(
            userTable.completionsUsedThisMonth,
          ),
        })
        .where(eq(userTable.id, ctx.user.id))
        .execute();

      const groqLLM = new GroqLLM(
        chatSession.messages,
        input.chatId,
        ctx.user.id,
      );

      const stream = processPrompt(
        groqLLM,
        input.context,
        input.input,
        input.useYaml,
      );

      await addMessageToChatSession(input.chatId, {
        role: "user",
        content: input.input,
      });

      let content = "";

      for await (const chunk of stream) {
        content += chunk;
        yield chunk;
      }

      await addMessageToChatSession(input.chatId, {
        role: "assistant",
        content,
      });

      await incrementNumberPromise;
    }),
} satisfies TRPCRouterRecord;
