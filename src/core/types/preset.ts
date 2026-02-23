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
  {
    id: "zen-reading",
    name: "Zen Reading",
    description: "Distraction-free edge-to-edge reading — no panels, no chrome",
    preferences: {
      zenMode: true,
      readingDensity: "compact",
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
    id: "theater",
    name: "Theater",
    description: "Full-screen verse-by-verse — massive Arabic, cinematic presentation",
    preferences: {
      readingFlow: "theater",
      showArabic: true,
      showTranslation: true,
      showVerseNumbers: true,
      showSurahHeaders: false,
      showBismillah: false,
    },
    panels: [],
  },
  {
    id: "focus-flow",
    name: "Focus Flow",
    description: "Scroll spotlight — active verse illuminated, surroundings fade",
    preferences: {
      readingFlow: "focus",
      readingDensity: "comfortable",
      showArabic: true,
      showTranslation: true,
      showVerseNumbers: true,
      showSurahHeaders: true,
      showBismillah: true,
    },
    panels: [],
  },
  {
    id: "mushaf",
    name: "Mushaf",
    description: "Open-book spread — Arabic right, translation left, page turns",
    preferences: {
      readingFlow: "mushaf",
      showArabic: true,
      showTranslation: true,
      showVerseNumbers: true,
      showSurahHeaders: false,
      showBismillah: false,
    },
    panels: [],
  },
];
