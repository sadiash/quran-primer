import { describe, it, expect, vi } from "vitest";
import { QuranService } from "./quran-service";
import type { QuranPort, TranslationPort, TafsirPort, AudioPort } from "@/core/ports";
import type { Surah, SurahWithVerses, Verse, Translation } from "@/core/types";

function createMockQuranPort(): QuranPort {
  const verse: Verse = {
    id: 1,
    verseKey: "1:1",
    verseNumber: 1,
    textUthmani: "بِسْمِ ٱللَّهِ",
    textSimple: "بِسْمِ اللَّهِ",
  };

  const surah: SurahWithVerses = {
    id: 1,
    nameArabic: "الفاتحة",
    nameSimple: "Al-Fatihah",
    nameComplex: "Al-Fātiĥah",
    nameTranslation: "The Opener",
    revelationType: "makkah",
    versesCount: 1,
    verses: [verse],
  };

  return {
    getAllSurahs: vi.fn().mockResolvedValue([surah as Surah]),
    getSurah: vi.fn().mockResolvedValue(surah),
    getVerse: vi.fn().mockResolvedValue(verse),
    getVerses: vi.fn().mockResolvedValue([verse]),
    search: vi.fn().mockResolvedValue([verse]),
  };
}

function createMockTranslationPort(): TranslationPort {
  const translation: Translation = {
    id: 1,
    resourceId: 131,
    resourceName: "Sahih International",
    languageCode: "en",
    verseKey: "1:1",
    text: "In the name of Allah",
  };

  return {
    getAvailableTranslations: vi.fn().mockResolvedValue([]),
    getTranslations: vi.fn().mockResolvedValue([translation]),
    getVerseTranslation: vi.fn().mockResolvedValue(translation),
  };
}

function createMockTafsirPort(): TafsirPort {
  return {
    getAvailableTafsirs: vi.fn().mockResolvedValue([]),
    getTafsir: vi.fn().mockResolvedValue(null),
  };
}

function createMockAudioPort(): AudioPort {
  return {
    getReciters: vi.fn().mockResolvedValue([]),
    getRecitation: vi.fn().mockResolvedValue([]),
    getVerseAudioUrl: vi.fn().mockResolvedValue(null),
  };
}

describe("QuranService", () => {
  function createService() {
    const deps = {
      quran: createMockQuranPort(),
      translations: createMockTranslationPort(),
      tafsir: createMockTafsirPort(),
      audio: createMockAudioPort(),
    };
    return { service: new QuranService(deps), deps };
  }

  it("getAllSurahs() delegates to quran port", async () => {
    const { service, deps } = createService();
    const surahs = await service.getAllSurahs();
    expect(deps.quran.getAllSurahs).toHaveBeenCalledOnce();
    expect(surahs).toHaveLength(1);
  });

  it("getSurah() delegates to quran port", async () => {
    const { service, deps } = createService();
    const surah = await service.getSurah(1);
    expect(deps.quran.getSurah).toHaveBeenCalledWith(1);
    expect(surah?.nameSimple).toBe("Al-Fatihah");
  });

  it("getSurahWithTranslation() fetches both in parallel", async () => {
    const { service, deps } = createService();
    const result = await service.getSurahWithTranslation(1, 131);

    expect(result).not.toBeNull();
    expect(result!.surah.nameSimple).toBe("Al-Fatihah");
    expect(result!.translations).toHaveLength(1);
    expect(deps.quran.getSurah).toHaveBeenCalledWith(1);
    expect(deps.translations.getTranslations).toHaveBeenCalledWith(1, 131);
  });

  it("getSurahWithTranslation() returns null if surah not found", async () => {
    const { service, deps } = createService();
    (deps.quran.getSurah as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const result = await service.getSurahWithTranslation(999, 131);
    expect(result).toBeNull();
  });

  it("searchQuran() delegates to quran port", async () => {
    const { service, deps } = createService();
    await service.searchQuran("بسم");
    expect(deps.quran.search).toHaveBeenCalledWith("بسم");
  });

  it("getTafsir() delegates to tafsir port", async () => {
    const { service, deps } = createService();
    await service.getTafsir("1:1", 1);
    expect(deps.tafsir.getTafsir).toHaveBeenCalledWith("1:1", 1);
  });

  it("getReciters() delegates to audio port", async () => {
    const { service, deps } = createService();
    await service.getReciters();
    expect(deps.audio.getReciters).toHaveBeenCalledOnce();
  });
});
