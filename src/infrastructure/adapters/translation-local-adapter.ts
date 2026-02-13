/**
 * Local-first translation adapter.
 * Reads bundled translations from data/translations/, falls back to API.
 */

import type { TranslationPort } from "@/core/ports";
import type { Translation, TranslationResource } from "@/core/types";
import { LruCache } from "@/infrastructure/cache";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "translations");
const INDEX_PATH = path.join(DATA_DIR, "index.json");

interface LocalIndex {
  id: number;
  name: string;
  authorName: string;
  languageCode: string;
  slug: string;
}

export class TranslationLocalAdapter implements TranslationPort {
  private readonly fallback: TranslationPort | null;
  private readonly cache = new LruCache<Translation[]>({
    maxSize: 50,
    ttlMs: 30 * 60 * 1000,
  });
  private indexCache: LocalIndex[] | null = null;

  constructor(fallback?: TranslationPort) {
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

  async getAvailableTranslations(): Promise<TranslationResource[]> {
    const local = await this.loadIndex();
    const localResources: TranslationResource[] = local.map((t) => ({
      id: t.id,
      name: t.name,
      authorName: t.authorName,
      languageCode: t.languageCode,
      slug: t.slug,
    }));

    if (!this.fallback) return localResources;

    try {
      const apiResources = await this.fallback.getAvailableTranslations();
      // Merge: local first, then API (excluding duplicates by name similarity)
      const localNames = new Set(
        localResources.map((r) => r.authorName.toLowerCase()),
      );
      const deduped = apiResources.filter(
        (r) => !localNames.has(r.authorName.toLowerCase()),
      );
      return [...localResources, ...deduped];
    } catch {
      return localResources;
    }
  }

  async getTranslations(
    surahId: number,
    translationId: number,
  ): Promise<Translation[]> {
    const cacheKey = `${surahId}:${translationId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Check if this translation is bundled locally
    const index = await this.loadIndex();
    const entry = index.find((t) => t.id === translationId);

    if (entry) {
      try {
        const filePath = path.join(
          DATA_DIR,
          entry.slug,
          String(surahId).padStart(3, "0") + ".json",
        );
        const raw = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(raw) as {
          verses: Array<{ verseKey: string; text: string }>;
        };

        const translations: Translation[] = data.verses.map((v, i) => ({
          id: i + 1,
          resourceId: entry.id,
          resourceName: entry.name,
          languageCode: entry.languageCode,
          verseKey: v.verseKey,
          text: v.text,
        }));

        this.cache.set(cacheKey, translations);
        return translations;
      } catch {
        // Local file missing or corrupt — fall through to API
      }
    }

    // Fall back to API
    if (this.fallback) {
      const result = await this.fallback.getTranslations(
        surahId,
        translationId,
      );
      this.cache.set(cacheKey, result);
      return result;
    }

    return [];
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
