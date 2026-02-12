/** Structured logger using Pino — server-side only */

import pino from "pino";

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

const isServer = typeof window === "undefined";
const isDev = process.env.NODE_ENV !== "production";

export const logger = isServer
  ? pino({
      level: (process.env.LOG_LEVEL as LogLevel) ?? (isDev ? "debug" : "info"),
      ...(isDev && {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
    })
  : // Client-side: no-op logger that doesn't import pino transport
    createNoopLogger();

function createNoopLogger() {
  const noop = () => {};
  return {
    trace: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop,
    fatal: noop,
    child: () => createNoopLogger(),
  } as unknown as pino.Logger;
}

/** Create a child logger with a bound context */
export function createLogger(context: Record<string, unknown>): pino.Logger {
  return logger.child(context);
}
