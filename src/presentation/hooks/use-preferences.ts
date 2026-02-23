"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/infrastructure/db/client";
import type { UserPreferences } from "@/core/types";
import { toUserPreferences } from "@/core/types";

const DEFAULT_PREFERENCES: UserPreferences = {
  id: "default",
  theme: "system",
  themeName: "library",
  arabicFont: "uthmani",
  arabicFontSize: "lg",
  translationFontSize: "md",
  showTranslation: true,
  defaultTranslationId: 1001,
  activeTranslationIds: [1001],
  translationLayout: "stacked",
  showArabic: true,
  showVerseNumbers: true,
  showSurahHeaders: true,
  showBismillah: true,
  defaultReciterId: 7,
  activeTafsirIds: [74],
  activeHadithCollections: ["bukhari", "muslim"],
  showConcepts: true,
  conceptMaxVisible: 5,
  conceptColorSlot: 0,
  zenMode: false,
  readingDensity: "compact",
  readingFlow: "blocks",
  paperTexture: "auto",
  onboardingComplete: false,
  updatedAt: new Date(0),
};

export function usePreferences() {
  const raw = useLiveQuery(() => db.preferences.get("default"), []);
  const isLoading = raw === undefined;
  const preferences: UserPreferences = raw
    ? toUserPreferences(raw)
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
