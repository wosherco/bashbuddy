import { adminRouter } from "./router/admin";
import { authRouter } from "./router/auth";
import { chatRouter } from "./router/chat";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  admin: adminRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
