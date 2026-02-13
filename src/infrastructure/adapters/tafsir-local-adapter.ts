/**
 * Local-first tafsir adapter.
 * Reads bundled tafsirs from data/tafsirs/, falls back to API.
 */

import type { TafsirPort } from "@/core/ports";
import type { Tafsir, TafsirResource } from "@/core/types";
import { LruCache } from "@/infrastructure/cache";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "tafsirs");
const INDEX_PATH = path.join(DATA_DIR, "index.json");

interface LocalIndex {
  id: number;
  name: string;
  authorName: string;
  languageCode: string;
  slug: string;
}

interface LocalSurahData {
  verses: Array<{ verseKey: string; text: string }>;
}

export class TafsirLocalAdapter implements TafsirPort {
  private readonly fallback: TafsirPort | null;
  private readonly cache = new LruCache<Tafsir>({
    maxSize: 200,
    ttlMs: 30 * 60 * 1000,
  });
  private readonly surahCache = new LruCache<LocalSurahData>({
    maxSize: 30,
    ttlMs: 30 * 60 * 1000,
  });
  private indexCache: LocalIndex[] | null = null;

  constructor(fallback?: TafsirPort) {
    this.fallback = fallback ?? null;
  }

  private async loadIndex(): Promise<LocalIndex[]> {
    if (this.indexCache) return this.indexCache;

    try {
      const raw = await fs.readFile(INDEX_PATH, "utf-8");
      this.indexCache = JSON.parse(raw) as LocalIndex[];
    } catch {
      this.indexCache = [];
    }
    return this.indexCache;
  }

  async getAvailableTafsirs(): Promise<TafsirResource[]> {
    const local = await this.loadIndex();
    const localResources: TafsirResource[] = local.map((t) => ({
      id: t.id,
      name: t.name,
      authorName: t.authorName,
      languageCode: t.languageCode,
      slug: t.slug,
    }));

    if (!this.fallback) return localResources;

    try {
      const apiResources = await this.fallback.getAvailableTafsirs();
      const localIds = new Set(localResources.map((r) => r.id));
      const deduped = apiResources.filter((r) => !localIds.has(r.id));
      return [...localResources, ...deduped];
    } catch {
      return localResources;
    }
  }

  async getTafsir(
    verseKey: string,
    tafsirId: number,
  ): Promise<Tafsir | null> {
    const cacheKey = `${verseKey}:${tafsirId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Check if this tafsir is bundled locally
    const index = await this.loadIndex();
    const entry = index.find((t) => t.id === tafsirId);

    if (entry) {
      try {
        const [surahStr] = verseKey.split(":");
        const surahId = Number(surahStr);
        if (!surahId) return null;

        // Load the surah file (cached)
        const surahCacheKey = `${entry.slug}:${surahId}`;
        let surahData = this.surahCache.get(surahCacheKey);

        if (!surahData) {
          const filePath = path.join(
            DATA_DIR,
            entry.slug,
            String(surahId).padStart(3, "0") + ".json",
          );
          const raw = await fs.readFile(filePath, "utf-8");
          surahData = JSON.parse(raw) as LocalSurahData;
          this.surahCache.set(surahCacheKey, surahData);
        }

        const verse = surahData.verses.find((v) => v.verseKey === verseKey);
        if (!verse) return null;

        const tafsir: Tafsir = {
          id: entry.id,
          resourceId: entry.id,
          resourceName: entry.name,
          languageCode: entry.languageCode,
          verseKey: verse.verseKey,
          text: verse.text,
        };

        this.cache.set(cacheKey, tafsir);
        return tafsir;
      } catch {
        // Local file missing — fall through to API
      }
    }

    // Fall back to API
    if (this.fallback) {
      return this.fallback.getTafsir(verseKey, tafsirId);
    }

    return null;
  }
}
