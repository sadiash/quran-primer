/** Fetches cross-scripture references from Scripturas.info API */

import type { CrossReferencePort } from "@/core/ports";
import type { CrossScriptureCluster, ScriptureVerse, ScriptureSource } from "@/core/types";
import { HttpClient } from "@/infrastructure/http";
import { LruCache } from "@/infrastructure/cache";
import { createLogger } from "@/infrastructure/logging";
import { surahSlugToNumber } from "@/lib/surah-slug-map";

const log = createLogger({ module: "adapter:cross-reference" });

const DEFAULT_BASE_URL = "https://scripturas.info/api";

/**
 * Raw cluster shape returned by the Scripturas.info API.
 * Each cluster contains an array of verse objects from different scriptures.
 */
interface ScripturasCluster {
  cluster_id: number | string;
  summary?: string;
  verses: ScripturasVerse[];
  similarity?: number;
}

interface ScripturasVerse {
  id: string; // e.g. "albaqarah:247" or "genesis:1:1"
  text: string;
  source: string; // "quran" | "bible" | "torah"
  book?: string;
  chapter?: number;
  verse?: number;
}

export class CrossReferenceAdapter implements CrossReferencePort {
  private readonly http: HttpClient;
  private readonly cache = new LruCache<CrossScriptureCluster[]>({
    maxSize: 200,
    ttlMs: 30 * 60 * 1000, // 30 min
  });

  constructor(baseUrl?: string) {
    this.http = new HttpClient({
      baseUrl: baseUrl ?? DEFAULT_BASE_URL,
      retries: 2,
      backoffMs: 500,
    });
  }

  async getCrossReferences(quranVerseKey: string): Promise<CrossScriptureCluster[]> {
    const cacheKey = `verse:${quranVerseKey}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const allClusters = await this.fetchAllClusters();

      // Filter to clusters that contain the requested Quran verse
      const matching = allClusters.filter((cluster) =>
        cluster.verses.some(
          (v) => v.source === "quran" && v.verseKey === quranVerseKey,
        ),
      );

      this.cache.set(cacheKey, matching);
      return matching;
    } catch (error) {
      log.error({ error, quranVerseKey }, "Failed to fetch cross-references");
      return [];
    }
  }

  async searchCrossReferences(query: string): Promise<CrossScriptureCluster[]> {
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const allClusters = await this.fetchAllClusters();
      const lowerQuery = query.toLowerCase();

      // Filter clusters by summary text or verse text
      const matching = allClusters.filter(
        (cluster) =>
          cluster.summary.toLowerCase().includes(lowerQuery) ||
          cluster.verses.some((v) => v.text.toLowerCase().includes(lowerQuery)),
      );

      this.cache.set(cacheKey, matching);
      return matching;
    } catch (error) {
      log.error({ error, query }, "Failed to search cross-references");
      return [];
    }
  }

  /** Fetch all clusters from Scripturas API with caching */
  private async fetchAllClusters(): Promise<CrossScriptureCluster[]> {
    const cacheKey = "__all_clusters__";
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const raw = await this.http.get<ScripturasCluster[]>(
      "/verse-clusters-sbert?cross_scripture=true&cluster_method=similarity_0.7_opt",
    );

    const clusters = (raw ?? []).map((c) => this.mapCluster(c));
    this.cache.set(cacheKey, clusters);
    return clusters;
  }

  /** Map a raw Scripturas cluster to our domain type */
  private mapCluster(raw: ScripturasCluster): CrossScriptureCluster {
    return {
      id: String(raw.cluster_id),
      summary: raw.summary ?? "",
      similarity: raw.similarity ?? 0,
      verses: raw.verses.map((v) => this.mapVerse(v)),
    };
  }

  /** Map a raw Scripturas verse to our domain type */
  private mapVerse(raw: ScripturasVerse): ScriptureVerse {
    const source = this.normaliseSource(raw.source);

    if (source === "quran") {
      return this.mapQuranVerse(raw);
    }

    return {
      source,
      book: raw.book ?? this.extractBook(raw.id),
      chapter: raw.chapter ?? this.extractChapter(raw.id),
      verse: raw.verse ?? this.extractVerse(raw.id),
      text: raw.text,
    };
  }

  private mapQuranVerse(raw: ScripturasVerse): ScriptureVerse {
    const verseKey = this.resolveQuranVerseKey(raw);
    const [surahStr, verseStr] = (verseKey ?? "0:0").split(":");

    return {
      source: "quran",
      book: "Quran",
      chapter: Number(surahStr) || 0,
      verse: Number(verseStr) || 0,
      text: raw.text,
      verseKey: verseKey,
    };
  }

  /** Resolve a Scripturas Quran verse ID to a standard verse key like "2:247" */
  private resolveQuranVerseKey(raw: ScripturasVerse): string | undefined {
    // If the API already provides chapter:verse fields
    if (raw.chapter && raw.verse) {
      return `${raw.chapter}:${raw.verse}`;
    }

    // Parse from the id field: e.g. "albaqarah:247"
    const match = raw.id.match(/^([a-z_-]+)[:/\-_](\d+)$/i);
    if (match) {
      const surahNum = surahSlugToNumber(match[1]!);
      if (surahNum) {
        return `${surahNum}:${match[2]!}`;
      }
    }

    return undefined;
  }

  private normaliseSource(source: string): ScriptureSource {
    const lower = source.toLowerCase();
    if (lower === "quran") return "quran";
    if (lower === "torah" || lower === "tanakh") return "torah";
    return "bible";
  }

  /** Extract book name from a non-Quran verse id like "genesis:1:1" */
  private extractBook(id: string): string {
    const parts = id.split(":");
    return parts[0] ?? id;
  }

  /** Extract chapter from id like "genesis:1:1" */
  private extractChapter(id: string): number {
    const parts = id.split(":");
    return Number(parts[1]) || 0;
  }

  /** Extract verse number from id like "genesis:1:1" */
  private extractVerse(id: string): number {
    const parts = id.split(":");
    return Number(parts[2]) || 0;
  }
}
