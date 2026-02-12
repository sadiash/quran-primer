/** Fetches translations from Quran.com API v4 */

import type { TranslationPort } from "@/core/ports";
import type { Translation, TranslationResource } from "@/core/types";
import { HttpClient } from "@/infrastructure/http";
import { LruCache } from "@/infrastructure/cache";

const DEFAULT_BASE_URL = "https://api.quran.com/api/v4";

interface QuranApiTranslationsResponse {
  translations: Array<{
    resource_id: number;
    resource_name: string;
    id: number;
    language_name: string;
    author_name: string;
    slug: string;
  }>;
}

interface QuranApiVerseTranslationsResponse {
  translations: Array<{
    id: number;
    resource_id: number;
    resource_name: string;
    language_id: number;
    text: string;
    verse_key: string;
  }>;
}

export class QuranTranslationAdapter implements TranslationPort {
  private readonly http: HttpClient;
  private readonly cache = new LruCache<Translation[]>({
    maxSize: 50,
    ttlMs: 10 * 60 * 1000, // 10 min
  });

  constructor(baseUrl?: string) {
    this.http = new HttpClient({
      baseUrl: baseUrl ?? DEFAULT_BASE_URL,
      retries: 2,
      backoffMs: 500,
    });
  }

  async getAvailableTranslations(): Promise<TranslationResource[]> {
    const data =
      await this.http.get<QuranApiTranslationsResponse>("/resources/translations");

    return data.translations.map((t) => ({
      id: t.resource_id ?? t.id,
      name: t.resource_name,
      authorName: t.author_name,
      languageCode: t.language_name,
      slug: t.slug,
    }));
  }

  async getTranslations(
    surahId: number,
    translationId: number,
  ): Promise<Translation[]> {
    const cacheKey = `${surahId}:${translationId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const data =
      await this.http.get<QuranApiVerseTranslationsResponse>(
        `/verses/by_chapter/${surahId}?translations=${translationId}&language=en&per_page=300&fields=verse_key`,
      );

    const translations: Translation[] = data.translations.map((t) => ({
      id: t.id,
      resourceId: t.resource_id,
      resourceName: t.resource_name,
      languageCode: "en",
      verseKey: t.verse_key,
      text: t.text,
    }));

    this.cache.set(cacheKey, translations);
    return translations;
  }

  async getVerseTranslation(
    verseKey: string,
    translationId: number,
  ): Promise<Translation | null> {
    const [surahStr] = verseKey.split(":");
    const surahId = Number(surahStr);
    if (!surahId) return null;

    const translations = await this.getTranslations(surahId, translationId);
    return translations.find((t) => t.verseKey === verseKey) ?? null;
  }
}
