import type { QuranicConcept, HadithTopic } from "@/core/types";

export interface OntologyPort {
  /** Get all Quranic concepts */
  getConcepts(): Promise<QuranicConcept[]>;

  /** Get concepts that reference a specific verse (e.g. "2:255") */
  getConceptsForVerse(verseKey: string): Promise<QuranicConcept[]>;

  /** Get all concepts for every verse in a surah, keyed by verseKey */
  getConceptsForSurah(surahId: number): Promise<Record<string, QuranicConcept[]>>;

  /** Get hadith IDs linked to a verse via the knowledge graph */
  getHadithsForVerse(verseKey: string): Promise<string[]>;

  /** Get verse keys linked to a hadith ID (e.g. "SB-HD0402") */
  getVersesForHadith(hadithId: string): Promise<string[]>;

  /** Get all topics from the knowledge graph */
  getTopics(): Promise<HadithTopic[]>;

  /** Get topic names for a specific hadith */
  getTopicsForHadith(hadithId: string): Promise<string[]>;

  /** Get topic names for a batch of hadith IDs */
  getTopicsBatch(hadithIds: string[]): Promise<Record<string, string[]>>;
}
