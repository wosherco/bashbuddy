import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "../env";

export { Ratelimit };

export function createRatelimit(
  identifier: string,
  limiter: ReturnType<typeof Ratelimit.slidingWindow>,
) {
  return new Ratelimit({
    redis: new Redis({
      url: env.REDIS_URL,
      token: env.REDIS_TOKEN,
    }),
    limiter,
    prefix: identifier,
  });
}
