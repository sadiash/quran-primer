/** QuranService — unified facade over Quran data ports */

import type { QuranPort, TranslationPort, TafsirPort, AudioPort } from "@/core/ports";
import type {
  Surah,
  SurahWithVerses,
  Verse,
  Translation,
  TranslationResource,
  Tafsir,
  TafsirResource,
  AudioRecitation,
  Reciter,
} from "@/core/types";

export interface QuranServiceDeps {
  quran: QuranPort;
  translations: TranslationPort;
  tafsir: TafsirPort;
  audio: AudioPort;
}

export class QuranService {
  private readonly deps: QuranServiceDeps;

  constructor(deps: QuranServiceDeps) {
    this.deps = deps;
  }

  // --- Quran text ---

  getAllSurahs(): Promise<Surah[]> {
    return this.deps.quran.getAllSurahs();
  }

  getSurah(surahId: number): Promise<SurahWithVerses | null> {
    return this.deps.quran.getSurah(surahId);
  }

  getVerse(verseKey: string): Promise<Verse | null> {
    return this.deps.quran.getVerse(verseKey);
  }

  searchQuran(query: string): Promise<Verse[]> {
    return this.deps.quran.search(query);
  }

  // --- Translations ---

  getAvailableTranslations(): Promise<TranslationResource[]> {
    return this.deps.translations.getAvailableTranslations();
  }

  getTranslations(
    surahId: number,
    translationId: number,
  ): Promise<Translation[]> {
    return this.deps.translations.getTranslations(surahId, translationId);
  }

  /** Get a surah with its translation in one call */
  async getSurahWithTranslation(
    surahId: number,
    translationId: number,
  ): Promise<{
    surah: SurahWithVerses;
    translations: Translation[];
  } | null> {
    const [surah, translations] = await Promise.all([
      this.deps.quran.getSurah(surahId),
      this.deps.translations.getTranslations(surahId, translationId),
    ]);

    if (!surah) return null;
    return { surah, translations };
  }

  // --- Tafsir ---

  getAvailableTafsirs(): Promise<TafsirResource[]> {
    return this.deps.tafsir.getAvailableTafsirs();
  }

  getTafsir(verseKey: string, tafsirId: number): Promise<Tafsir | null> {
    return this.deps.tafsir.getTafsir(verseKey, tafsirId);
  }

  // --- Audio ---

  getReciters(): Promise<Reciter[]> {
    return this.deps.audio.getReciters();
  }

  getRecitation(
    surahId: number,
    reciterId: number,
  ): Promise<AudioRecitation[]> {
    return this.deps.audio.getRecitation(surahId, reciterId);
  }

  getVerseAudioUrl(
    verseKey: string,
    reciterId: number,
  ): Promise<string | null> {
    return this.deps.audio.getVerseAudioUrl(verseKey, reciterId);
  }
}
