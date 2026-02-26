/** Environment validation with Zod */

import { z } from "zod/v4";

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  QURAN_API_BASE_URL: z
    .string()
    .url()
    .default("https://api.quran.com/api/v4"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("The Primer"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

let _serverEnv: ServerEnv | null = null;

/** Validate and return server environment. Throws on invalid config. */
export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;
  _serverEnv = serverEnvSchema.parse(process.env);
  return _serverEnv;
}

/** Validate and return client environment (NEXT_PUBLIC_ vars only). */
export function getClientEnv(): ClientEnv {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });
}

/** Reset cached env (for tests) */
export function resetEnvCache(): void {
  _serverEnv = null;
}
