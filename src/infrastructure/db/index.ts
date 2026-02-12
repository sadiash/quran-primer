// Client-side (Dexie/IndexedDB)
export {
  AppDatabase,
  db,
  DexieBookmarkRepository,
  DexieNoteRepository,
  DexieProgressRepository,
  DexiePreferencesRepository,
} from "./client";

// Server-side (Drizzle/PostgreSQL) — import from ./server directly
// to avoid pulling pg into client bundles
