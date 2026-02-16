/**
 * Local-first hadith adapter.
 * Reads bundled hadith data from data/hadith/, falls back to API.
 * Includes simple text search across local hadith data.
 */

import type { HadithPort } from "@/core/ports";
import type { Hadith, HadithCollection } from "@/core/types";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "hadith");
const INDEX_PATH = path.join(DATA_DIR, "index.json");

interface LocalIndex {
  id: string;
  name: string;
  hadithCount: number;
  chapterCount: number;
}

interface LocalChapterData {
  collection: string;
  collectionName: string;
  book: number;
  bookName: string;
  hadiths: Array<{
    id: number;
    hadithNumber: string;
    text: string;
    grade: string | null;
    narratedBy: string | null;
    reference: string | null;
    inBookReference: string | null;
  }>;
}

export class HadithLocalAdapter implements HadithPort {
  private readonly fallback: HadithPort | null;
  private indexCache: LocalIndex[] | null = null;
  /** Loaded hadith data per collection, lazily populated */
  private collectionData = new Map<string, LocalChapterData[]>();

  constructor(fallback?: HadithPort) {
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

  private async loadCollection(slug: string): Promise<LocalChapterData[]> {
    const cached = this.collectionData.get(slug);
    if (cached) return cached;

    const chapters: LocalChapterData[] = [];
    const collectionDir = path.join(DATA_DIR, slug);

    try {
      const files = await fs.readdir(collectionDir);
      const jsonFiles = files.filter((f) => f.endsWith(".json")).sort();

      for (const file of jsonFiles) {
        try {
          const raw = await fs.readFile(
            path.join(collectionDir, file),
            "utf-8",
          );
          chapters.push(JSON.parse(raw) as LocalChapterData);
        } catch {
          // Skip corrupt files
        }
      }
    } catch {
      // Directory doesn't exist
    }

    this.collectionData.set(slug, chapters);
    return chapters;
  }

  async getCollections(): Promise<HadithCollection[]> {
    const local = await this.loadIndex();
    const localCollections: HadithCollection[] = local.map((c) => ({
      id: c.id,
      name: c.name,
      hadithCount: c.hadithCount,
    }));

    if (!this.fallback) return localCollections;

    try {
      const apiCollections = await this.fallback.getCollections();
      const localIds = new Set(localCollections.map((c) => c.id));
      const deduped = apiCollections.filter((c) => !localIds.has(c.id));
      return [...localCollections, ...deduped];
    } catch {
      return localCollections;
    }
  }

  async searchHadith(
    query: string,
    collection?: string,
  ): Promise<Hadith[]> {
    if (!query.trim()) return [];

    const index = await this.loadIndex();
    const normalizedQuery = query.trim().toLowerCase();

    // Extract search terms (words > 2 chars for meaningful matching)
    const terms = normalizedQuery
      .split(/\s+/)
      .filter((t) => t.length > 2);

    if (terms.length === 0) return [];

    const results: Hadith[] = [];
    const collectionsToSearch = collection
      ? index.filter((c) => c.id === collection)
      : index;

    for (const col of collectionsToSearch) {
      const chapters = await this.loadCollection(col.id);

      for (const chapter of chapters) {
        for (const h of chapter.hadiths) {
          if (!h.text) continue;

          const textLower = h.text.toLowerCase();
          const narratorLower = (h.narratedBy || "").toLowerCase();
          const combined = textLower + " " + narratorLower;

          // Score: count how many terms match
          const matchCount = terms.filter((term) =>
            combined.includes(term),
          ).length;

          if (matchCount >= Math.max(1, Math.ceil(terms.length * 0.4))) {
            results.push({
              id: h.id,
              collection: chapter.collection,
              bookNumber: String(chapter.book),
              hadithNumber: h.hadithNumber,
              text: h.text,
              grade: h.grade,
              narratedBy: h.narratedBy,
              reference: h.reference ?? null,
              inBookReference: h.inBookReference ?? null,
            });
          }

          if (results.length >= 20) break;
        }
        if (results.length >= 20) break;
      }
      if (results.length >= 20) break;
    }

    // If local search found results, return them
    if (results.length > 0) return results;

    // Fall back to API
    if (this.fallback) {
      return this.fallback.searchHadith(query, collection);
    }

    return [];
  }
}
