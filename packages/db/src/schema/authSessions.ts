import type { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const authSessionTable = pgTable("auth_session", {
  id: uuid().defaultRandom().primaryKey(),
  expiresAt: timestamp()
    .notNull()
    .$defaultFn(() => {
      return new Date(Date.now() + 1000 * 60 * 5);
    }),
});

export type AuthSession = InferSelectModel<typeof authSessionTable>;
