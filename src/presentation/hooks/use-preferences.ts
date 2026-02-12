"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/infrastructure/db/client";
import type { UserPreferences } from "@/core/types";

const DEFAULT_PREFERENCES: UserPreferences = {
  id: "default",
  theme: "system",
  arabicFont: "uthmani",
  arabicFontSize: "lg",
  translationFontSize: "md",
  showTranslation: true,
  defaultTranslationId: 131,
  defaultReciterId: 7,
  updatedAt: new Date(0),
};

export function usePreferences() {
  const raw = useLiveQuery(() => db.preferences.get("default"), []);
  const isLoading = raw === undefined;
  const preferences: UserPreferences = raw
    ? {
        ...raw,
        theme: raw.theme as UserPreferences["theme"],
        arabicFont: raw.arabicFont as UserPreferences["arabicFont"],
        arabicFontSize: raw.arabicFontSize as UserPreferences["arabicFontSize"],
        translationFontSize:
          raw.translationFontSize as UserPreferences["translationFontSize"],
      }
    : DEFAULT_PREFERENCES;

  async function updatePreferences(
    partial: Partial<Omit<UserPreferences, "id">>,
  ): Promise<void> {
    const current = (await db.preferences.get("default")) ?? DEFAULT_PREFERENCES;
    await db.preferences.put({
      ...current,
      ...partial,
      id: "default",
      updatedAt: new Date(),
    });
  }

  return { preferences, isLoading, updatePreferences };
}
