import type { Surah, SurahWithVerses, Verse } from "@/core/types";

/** Read-only access to Quran text data (Arabic) */
export interface QuranPort {
  getAllSurahs(): Promise<Surah[]>;
  getSurah(surahId: number): Promise<SurahWithVerses | null>;
  getVerse(verseKey: string): Promise<Verse | null>;
  getVerses(surahId: number): Promise<Verse[]>;
  search(query: string): Promise<Verse[]>;
}
