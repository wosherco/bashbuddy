import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "../env";
import * as schema from "./schema";

export const connection = postgres(env.POSTGRES_URL);

export const db = drizzle(connection, {
  schema,
  casing: "snake_case",
});

export type DBType = typeof db;
export type TransactionClient = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export type TransactableDBType = TransactionClient | typeof db;
