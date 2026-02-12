import type { Hadith, HadithCollection } from "@/core/types";

/** Access to hadith collections */
export interface HadithPort {
  getCollections(): Promise<HadithCollection[]>;
  searchHadith(query: string, collection?: string): Promise<Hadith[]>;
}
