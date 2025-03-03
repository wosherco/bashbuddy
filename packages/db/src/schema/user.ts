import type { InferSelectModel } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const USER_ROLES = ["USER", "ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const userTable = pgTable("user", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  profilePicture: text(),
  role: varchar({ length: 255, enum: USER_ROLES }).notNull().default("USER"),

  // Payment stuff
  subscriptionId: text(),
  stripeCustomerId: text(),
  subscribedUntil: timestamp({ withTimezone: true }),

  // Onboarding stuff
  onboardingStep: integer().notNull().default(0),

  // Profile stuff
  alias: text(),
});

export const paymentTable = pgTable("payment", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => userTable.id),
  amount: integer().notNull(),
  timestamp: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const OAUTH_ACCOUNTS = ["GOOGLE"] as const;

export const accountTable = pgTable("account", {
  id: serial().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => userTable.id),
  platform: varchar({ length: 255, enum: OAUTH_ACCOUNTS }),
  platformId: text().notNull().unique(),
  profilePicture: text(),
});

export const sessionTable = pgTable("session", {
  id: text().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp({
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
export type Account = InferSelectModel<typeof accountTable>;
