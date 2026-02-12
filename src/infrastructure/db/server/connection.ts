/** Drizzle PostgreSQL connection — server-side only */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb(connectionString?: string) {
  if (_db) return _db;

  const url =
    connectionString ??
    process.env.DATABASE_URL ??
    "postgresql://quran:quran_dev@localhost:5432/quran_study";

  const pool = new pg.Pool({ connectionString: url });
  _db = drizzle(pool, { schema });
  return _db;
}

export type DrizzleDb = ReturnType<typeof getDb>;

/** Reset cached connection (for tests) */
export function resetDbConnection(): void {
  _db = null;
}
