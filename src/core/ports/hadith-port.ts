import type { Hadith, HadithBook, HadithCollection } from "@/core/types";

/** Access to hadith collections */
export interface HadithPort {
  getCollections(): Promise<HadithCollection[]>;
  searchHadith(query: string, collection?: string): Promise<Hadith[]>;
  /** List books/chapters for a collection */
  browseBooks(collection: string): Promise<HadithBook[]>;
  /** Get all hadiths in a specific book of a collection */
  browseHadiths(collection: string, bookNumber: number): Promise<Hadith[]>;
  /** Resolve ontology IDs (e.g. "SB-HD0003") to full Hadith objects */
  getHadithsByOntologyIds(ids: string[]): Promise<Hadith[]>;
}
