/** Drizzle-backed preferences repository */

import { eq } from "drizzle-orm";
import type { PreferencesRepository } from "@/core/ports";
import type { UserPreferences } from "@/core/types";
import type { DrizzleDb } from "./connection";
import { preferences } from "./schema";

export class DrizzlePreferencesRepository implements PreferencesRepository {
  constructor(private readonly db: DrizzleDb) {}

  async get(id?: string): Promise<UserPreferences | null> {
    const lookupId = id ?? "default";
    const rows = await this.db
      .select()
      .from(preferences)
      .where(eq(preferences.id, lookupId))
      .limit(1);

    return rows[0] ? toPreferences(rows[0]) : null;
  }

  async save(prefs: UserPreferences): Promise<void> {
    await this.db
      .insert(preferences)
      .values({
        id: prefs.id,
        theme: prefs.theme,
        arabicFont: prefs.arabicFont,
        arabicFontSize: prefs.arabicFontSize,
        translationFontSize: prefs.translationFontSize,
        showTranslation: prefs.showTranslation,
        defaultTranslationId: prefs.defaultTranslationId,
        defaultReciterId: prefs.defaultReciterId,
        updatedAt: prefs.updatedAt,
      })
      .onConflictDoUpdate({
        target: preferences.id,
        set: {
          theme: prefs.theme,
          arabicFont: prefs.arabicFont,
          arabicFontSize: prefs.arabicFontSize,
          translationFontSize: prefs.translationFontSize,
          showTranslation: prefs.showTranslation,
          defaultTranslationId: prefs.defaultTranslationId,
          defaultReciterId: prefs.defaultReciterId,
          updatedAt: prefs.updatedAt,
        },
      });
  }
}

function toPreferences(
  row: typeof preferences.$inferSelect,
): UserPreferences {
  return {
    id: row.id,
    theme: row.theme as UserPreferences["theme"],
    arabicFont: row.arabicFont as UserPreferences["arabicFont"],
    arabicFontSize: row.arabicFontSize as UserPreferences["arabicFontSize"],
    translationFontSize:
      row.translationFontSize as UserPreferences["translationFontSize"],
    showTranslation: row.showTranslation,
    defaultTranslationId: row.defaultTranslationId,
    defaultReciterId: row.defaultReciterId,
    updatedAt: row.updatedAt,
  };
}
