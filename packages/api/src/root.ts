import { adminRouter } from "./router/legacy/admin";
import { authRouter } from "./router/legacy/auth";
import { chatRouter } from "./router/legacy/chat";
import { v2ChatRouter } from "./router/v2/chat";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  admin: adminRouter,
  chat: chatRouter,

  v2: {
    chat: v2ChatRouter,
  },
});

// export type definition of API
export type AppRouter = typeof appRouter;
