import type { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const chatTable = pgTable("chat", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export type DBChat = InferSelectModel<typeof chatTable>;
