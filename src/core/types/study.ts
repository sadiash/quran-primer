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
  verseKey: string;
  surahId: number;
  content: string;
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

export interface UserPreferences {
  id: string; // "default" for local-only, or userId
  theme: ThemeMode;
  arabicFont: ArabicFont;
  arabicFontSize: ArabicFontSize;
  translationFontSize: TranslationFontSize;
  showTranslation: boolean;
  defaultTranslationId: number;
  defaultReciterId: number;
  updatedAt: Date;
}
