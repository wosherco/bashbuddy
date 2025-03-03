import type { AnyColumn } from "drizzle-orm";
import { sql } from "drizzle-orm";

export { sql, getTableColumns } from "drizzle-orm";
export type { AnyColumn } from "drizzle-orm";
export { alias } from "drizzle-orm/pg-core";
export * from "drizzle-orm/sql";

export const increment = (column: AnyColumn, value = 1) => {
  return sql`${column} + ${value}`;
};

export const decrement = (column: AnyColumn, value = 1) => {
  return sql`${column} - ${value}`;
};

export const lower = (column: AnyColumn) => {
  return sql<string>`LOWER(${column})`;
};
