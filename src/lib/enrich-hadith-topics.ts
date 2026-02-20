import "server-only";

import type { Hadith } from "@/core/types";
import { getOntologyAdapter } from "@/lib/services";

/** Map collection slug → ontology prefix */
const COLLECTION_PREFIX: Record<string, string> = {
  bukhari: "SB",
  muslim: "SM",
  tirmidhi: "AT",
  abudawud: "AD",
  nasai: "AN",
  ibnmajah: "IM",
};

/** Convert a Hadith to its ontology ID (e.g. "SB-HD0135") */
function toOntologyId(h: Hadith): string | null {
  const prefix = COLLECTION_PREFIX[h.collection];
  if (!prefix) return null;
  const num = parseInt(h.hadithNumber, 10);
  if (isNaN(num)) return null;
  return `${prefix}-HD${String(num).padStart(4, "0")}`;
}

/**
 * Enrich an array of hadiths with topic tags from the ontology.
 * Makes a single batch call then attaches topics to each hadith.
 */
export async function enrichHadithTopics(hadiths: Hadith[]): Promise<Hadith[]> {
  if (hadiths.length === 0) return hadiths;

  const ids = new Set<string>();
  for (const h of hadiths) {
    const ontId = toOntologyId(h);
    if (ontId) ids.add(ontId);
  }

  if (ids.size === 0) return hadiths;

  const topicsBatch = await getOntologyAdapter().getTopicsBatch([...ids]);

  return hadiths.map((h) => {
    const ontId = toOntologyId(h);
    if (!ontId) return h;
    const topics = topicsBatch[ontId];
    if (!topics || topics.length === 0) return h;
    return { ...h, topics };
  });
}
