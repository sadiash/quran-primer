/** Quranic concept from the ontology dataset */
export interface QuranicConcept {
  id: string;
  definition: string;
  subcategories: { id: string; name: string }[];
  relatedConcepts: { id: string; name: string }[];
  verses: { surahId: number; verseId: number }[];
}

/** Hadith-verse link derived from the semantic hadith knowledge graph */
export interface HadithVerseLink {
  verseKey: string;
  hadithIds: string[];
}

/** Topic from the semantic hadith knowledge graph */
export interface HadithTopic {
  id: string;
  subTopics: string[];
  hadithCount: number;
}
