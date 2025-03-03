import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { invalidateSession } from "@bashbuddy/auth";
import { db } from "@bashbuddy/db/client";
import { authSessionTable } from "@bashbuddy/db/schema";
import { socketless } from "@bashbuddy/socketless";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  getUser: protectedProcedure
    .output(
      z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        profilePicture: z.string().nullable(),
      }),
    )
    .query(({ ctx }) => {
      return {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        profilePicture: ctx.user.profilePicture,
      };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await invalidateSession(ctx.session.id);
  }),

  createAuthSession: publicProcedure.mutation(async () => {
    const [session] = await db.insert(authSessionTable).values({}).returning();

    if (!session) {
      throw new Error("Failed to create auth session");
    }

    const socketlessSession = await socketless.getConnection(
      `authSession:v1:${session.id}`,
    );

    return {
      id: session.id,
      url: socketlessSession.url,
    };
  }),
} satisfies TRPCRouterRecord;
