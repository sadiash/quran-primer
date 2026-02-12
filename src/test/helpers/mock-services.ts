import { vi } from "vitest";
import { createMockSurah, createMockSurahWithVerses, createMockVerse } from "./mock-data";
import type { QuranService } from "@/core/services/quran-service";

export function createMockQuranService(): {
  [K in keyof QuranService]: ReturnType<typeof vi.fn>;
} {
  return {
    getAllSurahs: vi.fn().mockResolvedValue([createMockSurah()]),
    getSurah: vi.fn().mockResolvedValue(createMockSurahWithVerses()),
    getVerse: vi.fn().mockResolvedValue(createMockVerse()),
    searchQuran: vi.fn().mockResolvedValue([createMockVerse()]),
    getSurahWithTranslation: vi.fn().mockResolvedValue({
      surah: createMockSurahWithVerses(),
      translations: [],
    }),
    getAvailableTranslations: vi.fn().mockResolvedValue([]),
    getTranslations: vi.fn().mockResolvedValue([]),
    getAvailableTafsirs: vi.fn().mockResolvedValue([]),
    getTafsir: vi.fn().mockResolvedValue(null),
    getReciters: vi.fn().mockResolvedValue([]),
    getRecitation: vi.fn().mockResolvedValue([]),
    getVerseAudioUrl: vi.fn().mockResolvedValue(null),
  };
}

export function createMockHadithAdapter() {
  return {
    getCollections: vi.fn().mockResolvedValue([]),
    searchHadith: vi.fn().mockResolvedValue([]),
  };
}
