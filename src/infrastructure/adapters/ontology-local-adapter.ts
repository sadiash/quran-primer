/**
 * Local-first ontology adapter.
 * Reads bundled ontology.json and derived semantic-hadith JSON files.
 * All data is lazily loaded and cached in memory (total ~2-5 MB).
 */

import type { OntologyPort } from "@/core/ports";
import type { QuranicConcept, HadithTopic } from "@/core/types";
import fs from "fs/promises";
import path from "path";

const ONTOLOGY_PATH = path.join(
  process.cwd(),
  "data/ontology/ontology.json",
);
const SEMANTIC_DIR = path.join(
  process.cwd(),
  "data/ontology/semantic-hadith",
);

/** Raw shape of a concept in ontology.json */
interface RawConcept {
  Definition: string;
  Subcategories: { id: string; name: string }[];
  "Related Concepts": { id: string; name: string }[];
  "Verses List": { surah_id: number; verse_id: number }[];
}

export class OntologyLocalAdapter implements OntologyPort {
  // ── Caches ───────────────────────────────────────────────────────
  private conceptsCache: QuranicConcept[] | null = null;
  /** verseKey → concepts that reference it */
  private conceptsByVerse: Map<string, QuranicConcept[]> | null = null;

  private hadithVersesCache: Record<string, string[]> | null = null;
  /** Reverse index: hadithId → verseKeys */
  private hadithToVerses: Map<string, string[]> | null = null;

  private hadithTopicsCache: Record<string, string[]> | null = null;
  private topicsCache: Record<string, { subTopics: string[]; hadithCount: number }> | null = null;

  // ── Lazy loaders ─────────────────────────────────────────────────

  private async loadConcepts(): Promise<QuranicConcept[]> {
    if (this.conceptsCache) return this.conceptsCache;

    try {
      const raw = await fs.readFile(ONTOLOGY_PATH, "utf-8");
      const data = JSON.parse(raw) as Record<string, RawConcept>;

      this.conceptsCache = Object.entries(data).map(([id, c]) => ({
        id,
        definition: c.Definition,
        subcategories: c.Subcategories ?? [],
        relatedConcepts: c["Related Concepts"] ?? [],
        verses: (c["Verses List"] ?? []).map((v) => ({
          surahId: v.surah_id,
          verseId: v.verse_id,
        })),
      }));
    } catch {
      this.conceptsCache = [];
    }

    return this.conceptsCache;
  }

  private async loadConceptsByVerse(): Promise<Map<string, QuranicConcept[]>> {
    if (this.conceptsByVerse) return this.conceptsByVerse;

    const concepts = await this.loadConcepts();
    this.conceptsByVerse = new Map();

    for (const concept of concepts) {
      for (const v of concept.verses) {
        const key = `${v.surahId}:${v.verseId}`;
        if (!this.conceptsByVerse.has(key)) {
          this.conceptsByVerse.set(key, []);
        }
        this.conceptsByVerse.get(key)!.push(concept);
      }
    }

    return this.conceptsByVerse;
  }

  private async loadHadithVerses(): Promise<Record<string, string[]>> {
    if (this.hadithVersesCache) return this.hadithVersesCache;

    try {
      const raw = await fs.readFile(
        path.join(SEMANTIC_DIR, "hadith-verses.json"),
        "utf-8",
      );
      this.hadithVersesCache = JSON.parse(raw) as Record<string, string[]>;
    } catch {
      this.hadithVersesCache = {};
    }

    return this.hadithVersesCache;
  }

  private async loadHadithToVerses(): Promise<Map<string, string[]>> {
    if (this.hadithToVerses) return this.hadithToVerses;

    const verseMap = await this.loadHadithVerses();
    this.hadithToVerses = new Map();

    for (const [verseKey, hadithIds] of Object.entries(verseMap)) {
      for (const id of hadithIds) {
        if (!this.hadithToVerses.has(id)) {
          this.hadithToVerses.set(id, []);
        }
        this.hadithToVerses.get(id)!.push(verseKey);
      }
    }

    return this.hadithToVerses;
  }

  private async loadHadithTopics(): Promise<Record<string, string[]>> {
    if (this.hadithTopicsCache) return this.hadithTopicsCache;

    try {
      const raw = await fs.readFile(
        path.join(SEMANTIC_DIR, "hadith-topics.json"),
        "utf-8",
      );
      this.hadithTopicsCache = JSON.parse(raw) as Record<string, string[]>;
    } catch {
      this.hadithTopicsCache = {};
    }

    return this.hadithTopicsCache;
  }

  private async loadTopics(): Promise<
    Record<string, { subTopics: string[]; hadithCount: number }>
  > {
    if (this.topicsCache) return this.topicsCache;

    try {
      const raw = await fs.readFile(
        path.join(SEMANTIC_DIR, "topics.json"),
        "utf-8",
      );
      this.topicsCache = JSON.parse(raw) as Record<
        string,
        { subTopics: string[]; hadithCount: number }
      >;
    } catch {
      this.topicsCache = {};
    }

    return this.topicsCache;
  }

  // ── Port implementation ──────────────────────────────────────────

  async getConcepts(): Promise<QuranicConcept[]> {
    return this.loadConcepts();
  }

  async getConceptsForVerse(verseKey: string): Promise<QuranicConcept[]> {
    const index = await this.loadConceptsByVerse();
    return index.get(verseKey) ?? [];
  }

  async getConceptsForSurah(surahId: number): Promise<Record<string, QuranicConcept[]>> {
    const index = await this.loadConceptsByVerse();
    const prefix = `${surahId}:`;
    const result: Record<string, QuranicConcept[]> = {};
    for (const [key, concepts] of index) {
      if (key.startsWith(prefix)) {
        result[key] = concepts;
      }
    }
    return result;
  }

  async getHadithsForVerse(verseKey: string): Promise<string[]> {
    const data = await this.loadHadithVerses();
    return data[verseKey] ?? [];
  }

  async getVersesForHadith(hadithId: string): Promise<string[]> {
    const index = await this.loadHadithToVerses();
    return index.get(hadithId) ?? [];
  }

  async getTopics(): Promise<HadithTopic[]> {
    const data = await this.loadTopics();
    return Object.entries(data).map(([id, t]) => ({
      id,
      subTopics: t.subTopics,
      hadithCount: t.hadithCount,
    }));
  }

  async getTopicsForHadith(hadithId: string): Promise<string[]> {
    const data = await this.loadHadithTopics();
    return data[hadithId] ?? [];
  }

  async getTopicsBatch(hadithIds: string[]): Promise<Record<string, string[]>> {
    const data = await this.loadHadithTopics();
    const result: Record<string, string[]> = {};
    for (const id of hadithIds) {
      const topics = data[id];
      if (topics && topics.length > 0) {
        result[id] = topics;
      }
    }
    return result;
  }

  async getAllHadithVerses(): Promise<Record<string, string[]>> {
    return this.loadHadithVerses();
  }

  async getAllHadithTopics(): Promise<Record<string, string[]>> {
    return this.loadHadithTopics();
  }
}
