/** Fetches audio recitation data from Quran.com API v4 */

import type { AudioPort } from "@/core/ports";
import type { AudioRecitation, Reciter } from "@/core/types";
import { HttpClient } from "@/infrastructure/http";
import { LruCache } from "@/infrastructure/cache";

const DEFAULT_BASE_URL = "https://api.quran.com/api/v4";

interface QuranApiRecitersResponse {
  reciters: Array<{
    id: number;
    reciter_name: string;
    style: string | null;
    translated_name: { name: string };
  }>;
}

interface QuranApiAudioResponse {
  audio_files: Array<{
    verse_key: string;
    url: string;
  }>;
}

export class AudioAdapter implements AudioPort {
  private readonly http: HttpClient;
  private readonly cache = new LruCache<AudioRecitation[]>({
    maxSize: 30,
    ttlMs: 10 * 60 * 1000,
  });

  constructor(baseUrl?: string) {
    this.http = new HttpClient({
      baseUrl: baseUrl ?? DEFAULT_BASE_URL,
      retries: 2,
      backoffMs: 500,
    });
  }

  async getReciters(): Promise<Reciter[]> {
    const data = await this.http.get<QuranApiRecitersResponse>(
      "/resources/recitations",
    );

    return data.reciters.map((r) => ({
      id: r.id,
      name: r.reciter_name,
      style: r.style,
      translatedName: r.translated_name.name,
    }));
  }

  async getRecitation(
    surahId: number,
    reciterId: number,
  ): Promise<AudioRecitation[]> {
    const cacheKey = `${surahId}:${reciterId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const data = await this.http.get<QuranApiAudioResponse>(
      `/recitations/${reciterId}/by_chapter/${surahId}`,
    );

    const recitations: AudioRecitation[] = data.audio_files.map((a) => ({
      verseKey: a.verse_key,
      url: a.url.startsWith("http") ? a.url : `https://audio.qurancdn.com/${a.url}`,
    }));

    this.cache.set(cacheKey, recitations);
    return recitations;
  }

  async getVerseAudioUrl(
    verseKey: string,
    reciterId: number,
  ): Promise<string | null> {
    const [surahStr] = verseKey.split(":");
    const surahId = Number(surahStr);
    if (!surahId) return null;

    const recitations = await this.getRecitation(surahId, reciterId);
    return recitations.find((r) => r.verseKey === verseKey)?.url ?? null;
  }
}
