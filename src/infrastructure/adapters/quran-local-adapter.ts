/** Reads Quran data from bundled JSON files in data/quran/ */

import type { QuranPort } from "@/core/ports";
import type { Surah, SurahWithVerses, Verse } from "@/core/types";
import { LruCache } from "@/infrastructure/cache";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "quran");
const METADATA_PATH = path.join(DATA_DIR, "metadata.json");

export class QuranLocalAdapter implements QuranPort {
  private readonly cache = new LruCache<SurahWithVerses>({
    maxSize: 20,
    ttlMs: 30 * 60 * 1000, // 30 min
  });
  private metadataCache: Surah[] | null = null;

  async getAllSurahs(): Promise<Surah[]> {
    if (this.metadataCache) return this.metadataCache;

    const raw = await fs.readFile(METADATA_PATH, "utf-8");
    this.metadataCache = JSON.parse(raw) as Surah[];
    return this.metadataCache;
  }

  async getSurah(surahId: number): Promise<SurahWithVerses | null> {
    const key = String(surahId);
    const cached = this.cache.get(key);
    if (cached) return cached;

    const filePath = path.join(
      DATA_DIR,
      "surahs",
      String(surahId).padStart(3, "0") + ".json",
    );

    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const surah = JSON.parse(raw) as SurahWithVerses;
      this.cache.set(key, surah);
      return surah;
    } catch {
      return null;
    }
  }

  async getVerse(verseKey: string): Promise<Verse | null> {
    const [surahStr] = verseKey.split(":");
    const surahId = Number(surahStr);
    if (!surahId || surahId < 1 || surahId > 114) return null;

    const surah = await this.getSurah(surahId);
    if (!surah) return null;

    return surah.verses.find((v) => v.verseKey === verseKey) ?? null;
  }

  async getVerses(surahId: number): Promise<Verse[]> {
    const surah = await this.getSurah(surahId);
    return surah?.verses ?? [];
  }

  async search(query: string): Promise<Verse[]> {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const results: Verse[] = [];
    const allSurahs = await this.getAllSurahs();

    for (const surahMeta of allSurahs) {
      const surah = await this.getSurah(surahMeta.id);
      if (!surah) continue;

      for (const verse of surah.verses) {
        if (
          verse.textSimple.includes(query) ||
          verse.textUthmani.includes(query)
        ) {
          results.push(verse);
        }
      }

      if (results.length >= 50) break; // cap results
    }

    return results;
  }
}
