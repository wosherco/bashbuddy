import { browser } from "$app/environment";

import { pinoLogger } from "@bashbuddy/logger";

export const logger = pinoLogger({ isBrowser: browser });
