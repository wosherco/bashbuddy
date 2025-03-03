import pino from "pino";

import { env } from "../env";

interface LoggerOptions {
  isBrowser?: boolean;
}

export type Logger = ReturnType<typeof pinoLogger>;

export function pinoLogger({ isBrowser = false }: LoggerOptions = {}) {
  const isDevelopment = env.PUBLIC_ENVIRONMENT === "development";

  const baseOptions: pino.LoggerOptions = {
    level: env.LOG_LEVEL,
    browser: {
      write: {
        info: (o) => console.info(o),
        error: (o) => console.error(o),
        warn: (o) => console.warn(o),
        debug: (o) => console.debug(o),
        trace: (o) => console.trace(o),
        fatal: (o) => console.error(o),
      },
    },
  };

  // Add pretty printing for development environments
  if (isDevelopment && !isBrowser) {
    baseOptions.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    };
  }

  // Browser specific settings
  if (isBrowser) {
    baseOptions.browser = {
      ...baseOptions.browser,
      asObject: true,
      transmit: {
        level: "error",
        send: async (level, logEvent) => {
          // Here you could implement error reporting to your backend
          // For example sending errors to your error tracking service
        },
      },
    };
  }

  return pino(baseOptions);
}
