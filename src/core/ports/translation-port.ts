import type { Translation, TranslationResource } from "@/core/types";

/** Access to Quran translations */
export interface TranslationPort {
  getAvailableTranslations(): Promise<TranslationResource[]>;
  getTranslations(
    surahId: number,
    translationId: number,
  ): Promise<Translation[]>;
  getVerseTranslation(
    verseKey: string,
    translationId: number,
  ): Promise<Translation | null>;
}
