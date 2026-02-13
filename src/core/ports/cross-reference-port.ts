import type { CrossScriptureCluster } from "@/core/types";

/** Access to cross-scripture references (Quran-Bible-Torah) */
export interface CrossReferencePort {
  getCrossReferences(quranVerseKey: string): Promise<CrossScriptureCluster[]>;
  searchCrossReferences(query: string): Promise<CrossScriptureCluster[]>;
}
