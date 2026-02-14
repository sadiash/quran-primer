/** Study-related domain types — bookmarks, notes, progress, preferences */

export interface Bookmark {
  id: string;
  verseKey: string;
  surahId: number;
  note: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  verseKeys: string[];    // ["1:1", "2:255"] or [] for standalone
  surahIds: number[];     // [1] for whole-surah link, or []
  content: string;
  contentJson?: string;   // TipTap JSON for rich text, alongside plain text for backward compat
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  surahId: number;
  lastVerseKey: string;
  lastVerseNumber: number;
  completedVerses: number;
  totalVerses: number;
  updatedAt: Date;
}

export type ThemeMode = "light" | "dark" | "system";
export type ArabicFont = "uthmani" | "simple";
export type ArabicFontSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type TranslationFontSize = "sm" | "md" | "lg";
export type TranslationLayout = "stacked" | "columnar";

export type ThemeName =
  | "library"
  | "observatory"
  | "amethyst"
  | "cosmos"
  | "midnight"
  | "sahara"
  | "garden"
  | "matrix";

export interface UserPreferences {
  id: string; // "default" for local-only, or userId
  theme: ThemeMode;
  themeName: ThemeName;
  arabicFont: ArabicFont;
  arabicFontSize: ArabicFontSize;
  translationFontSize: TranslationFontSize;
  showTranslation: boolean;
  defaultTranslationId: number;
  activeTranslationIds: number[];
  translationLayout: TranslationLayout;
  showArabic: boolean;
  showVerseNumbers: boolean;
  showSurahHeaders: boolean;
  showBismillah: boolean;
  defaultReciterId: number;
  activeTafsirIds: number[];
  activeHadithCollections: string[];
  onboardingComplete: boolean;
  updatedAt: Date;
}

/** Convert a loosely-typed storage record to a strictly-typed UserPreferences. */
export function toUserPreferences(raw: {
  id: string;
  theme: string;
  themeName?: string | null;
  arabicFont: string;
  arabicFontSize: string;
  translationFontSize: string;
  showTranslation: boolean;
  defaultTranslationId: number;
  activeTranslationIds?: number[] | null;
  translationLayout?: string | null;
  showArabic?: boolean | null;
  showVerseNumbers?: boolean | null;
  showSurahHeaders?: boolean | null;
  showBismillah?: boolean | null;
  defaultReciterId: number;
  activeTafsirIds?: number[] | null;
  activeHadithCollections?: string[] | null;
  onboardingComplete?: boolean | null;
  updatedAt: Date;
}): UserPreferences {
  return {
    id: raw.id,
    theme: raw.theme as ThemeMode,
    themeName: (raw.themeName ?? "library") as ThemeName,
    arabicFont: raw.arabicFont as ArabicFont,
    arabicFontSize: raw.arabicFontSize as ArabicFontSize,
    translationFontSize: raw.translationFontSize as TranslationFontSize,
    showTranslation: raw.showTranslation,
    defaultTranslationId: raw.defaultTranslationId,
    activeTranslationIds: raw.activeTranslationIds ?? [1001],
    translationLayout: (raw.translationLayout === "columnar" ? "columnar" : "stacked") as TranslationLayout,
    showArabic: raw.showArabic ?? true,
    showVerseNumbers: raw.showVerseNumbers ?? true,
    showSurahHeaders: raw.showSurahHeaders ?? true,
    showBismillah: raw.showBismillah ?? true,
    defaultReciterId: raw.defaultReciterId,
    activeTafsirIds: raw.activeTafsirIds ?? [74],
    activeHadithCollections: raw.activeHadithCollections ?? ["bukhari", "muslim"],
    onboardingComplete: raw.onboardingComplete ?? false,
    updatedAt: raw.updatedAt,
  };
}

/** Human-readable location label for a note */
export function noteLocationLabel(
  note: Note,
  getSurahName: (id: number) => string,
): string {
  const totalRefs = note.verseKeys.length + note.surahIds.length;
  if (totalRefs === 0) return "Standalone";
  if (totalRefs === 1) {
    if (note.verseKeys.length === 1) {
      const parts = note.verseKeys[0]!.split(":");
      return `${getSurahName(Number(parts[0]))} ${parts[0]}:${parts[1]}`;
    }
    return `${getSurahName(note.surahIds[0]!)} (surah)`;
  }
  return `${totalRefs} references`;
}
