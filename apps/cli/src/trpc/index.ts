import { createTRPCClient, unstable_httpBatchStreamLink } from "@trpc/client";
import SuperJSON from "superjson";

import type { AppRouter } from "@bashbuddy/api/";
import { SITE_URLS } from "@bashbuddy/consts";

import { ConfigManager } from "../utils/config";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    unstable_httpBatchStreamLink({
      url: `${SITE_URLS.API_URL}/trpc`,
      transformer: SuperJSON,
      async headers() {
        const token = await ConfigManager.getCloudToken();

        if (!token) {
          return {};
        }

        return {
          Authorization: `Bearer ${token}`,
        };
      },
    }),
  ],
});
