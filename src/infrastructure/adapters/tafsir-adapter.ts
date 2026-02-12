/** Fetches tafsir (commentary) data from Quran.com API v4 */

import type { TafsirPort } from "@/core/ports";
import type { Tafsir, TafsirResource } from "@/core/types";
import { HttpClient } from "@/infrastructure/http";
import { LruCache } from "@/infrastructure/cache";

const DEFAULT_BASE_URL = "https://api.quran.com/api/v4";

interface QuranApiTafsirsResponse {
  tafsirs: Array<{
    id: number;
    name: string;
    author_name: string;
    slug: string;
    language_name: string;
  }>;
}

interface QuranApiTafsirResponse {
  tafsir: {
    id: number;
    resource_id: number;
    resource_name: string;
    language_id: number;
    text: string;
    verse_key: string;
  };
}

export class TafsirAdapter implements TafsirPort {
  private readonly http: HttpClient;
  private readonly cache = new LruCache<Tafsir>({
    maxSize: 100,
    ttlMs: 10 * 60 * 1000,
  });

  constructor(baseUrl?: string) {
    this.http = new HttpClient({
      baseUrl: baseUrl ?? DEFAULT_BASE_URL,
      retries: 2,
      backoffMs: 500,
    });
  }

  async getAvailableTafsirs(): Promise<TafsirResource[]> {
    const data =
      await this.http.get<QuranApiTafsirsResponse>("/resources/tafsirs");

    return data.tafsirs.map((t) => ({
      id: t.id,
      name: t.name,
      authorName: t.author_name,
      languageCode: t.language_name,
      slug: t.slug,
    }));
  }

  async getTafsir(
    verseKey: string,
    tafsirId: number,
  ): Promise<Tafsir | null> {
    const cacheKey = `${verseKey}:${tafsirId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.http.get<QuranApiTafsirResponse>(
        `/tafsirs/${tafsirId}/by_ayah/${verseKey}`,
      );

      const tafsir: Tafsir = {
        id: data.tafsir.id,
        resourceId: data.tafsir.resource_id,
        resourceName: data.tafsir.resource_name,
        languageCode: "en",
        verseKey: data.tafsir.verse_key,
        text: data.tafsir.text,
      };

      this.cache.set(cacheKey, tafsir);
      return tafsir;
    } catch {
      return null;
    }
  }
}
