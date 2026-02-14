import type { UserPreferences } from "./study";
import type { PanelId } from "./panel";

export interface WorkspacePreset {
  id: string;
  name: string;
  description: string;
  preferences: Partial<Omit<UserPreferences, "id" | "updatedAt">>;
  panels: PanelId[];
}

export const BUILT_IN_PRESETS: WorkspacePreset[] = [
  {
    id: "daily-reading",
    name: "Daily Reading",
    description: "Clean reading view — Arabic + single translation, no panels",
    preferences: {
      showArabic: true,
      showTranslation: true,
      showVerseNumbers: true,
      showSurahHeaders: true,
      showBismillah: true,
      translationLayout: "stacked",
    },
    panels: [],
  },
  {
    id: "deep-study",
    name: "Deep Study",
    description: "Tafsir, hadith, and notes open for thorough study",
    preferences: {
      showArabic: true,
      showTranslation: true,
      showVerseNumbers: true,
      showSurahHeaders: true,
      showBismillah: true,
      translationLayout: "stacked",
    },
    panels: ["tafsir", "hadith", "notes"],
  },
  {
    id: "translation-comparison",
    name: "Translation Comparison",
    description: "Side-by-side translations for comparative reading",
    preferences: {
      showArabic: true,
      showTranslation: true,
      showVerseNumbers: true,
      showSurahHeaders: true,
      showBismillah: true,
      translationLayout: "columnar",
    },
    panels: [],
  },
];
