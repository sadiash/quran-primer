/** Dexie-backed preferences repository */

import type { PreferencesRepository } from "@/core/ports";
import type { UserPreferences } from "@/core/types";
import { db } from "./schema";

const DEFAULT_ID = "default";

export class DexiePreferencesRepository implements PreferencesRepository {
  async get(id?: string): Promise<UserPreferences | null> {
    const record = await db.preferences.get(id ?? DEFAULT_ID);
    if (!record) return null;

    return {
      ...record,
      theme: record.theme as UserPreferences["theme"],
      arabicFont: record.arabicFont as UserPreferences["arabicFont"],
      arabicFontSize: record.arabicFontSize as UserPreferences["arabicFontSize"],
      translationFontSize:
        record.translationFontSize as UserPreferences["translationFontSize"],
    };
  }

  async save(preferences: UserPreferences): Promise<void> {
    await db.preferences.put(preferences);
  }
}
