import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { env } from "../env";

export { Ratelimit };

const chatMessageSchema = z.object({
  role: z.enum(["user", "model", "system"]),
  content: z.string(),
});

type ChatMessage = z.infer<typeof chatMessageSchema>;

const chatSessionSchema = z.object({
  userId: z.string(),
  messages: z.array(chatMessageSchema),
});

type ChatSession = z.infer<typeof chatSessionSchema>;

const redis = new Redis({
  url: env.REDIS_URL,
  token: env.REDIS_TOKEN,
});

export async function createChatSession(userId: string) {
  const id = Bun.randomUUIDv7();

  await redis.hset(id, {
    userId,
    messages: [],
  } satisfies ChatSession);

  // In 10 minutes
  await redis.expire(id, 60 * 10);

  return id;
}

export async function getChatSession(id: string) {
  const session = await redis.hgetall(id);

  if (!session) {
    throw new Error("Chat session not found");
  }

  return chatSessionSchema.parse(session);
}

export async function addMessageToChatSession(
  id: string,
  messages: ChatMessage | ChatMessage[],
) {
  const session = await getChatSession(id);

  const actualMessages = Array.isArray(messages) ? messages : [messages];

  await redis.hset(id, {
    userId: session.userId,
    messages: [...session.messages, ...actualMessages],
  } satisfies ChatSession);
}
