import { ok, badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { getHadithAdapter, getOntologyAdapter } from "@/lib/services";
import { enrichHadithTopics } from "@/lib/enrich-hadith-topics";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";
import type { Hadith } from "@/core/types";

const log = createLogger({ module: "api:hadith:concept-search" });

/** Concepts too generic to produce useful hadith search results */
const BLOCKED_CONCEPTS = new Set([
  "concept", "artifact", "event", "location", "language",
  "living-creation", "sentient-creation", "physical-attribute",
  "astronomical-body", "false-deity", "holy-book",
  "allah", "earth", "water", "fire", "stone", "clay", "bone",
  "gold", "silver", "iron", "glass", "lamp", "star",
  "king", "child", "man", "woman",
]);

/** Max total results */
const MAX_RESULTS = 20;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const verse = url.searchParams.get("verse");

    if (!verse || !/^\d+:\d+$/.test(verse)) {
      return toResponse(badRequest("verse parameter is required (e.g. 2:255)"));
    }

    // Exclude direct-link hadith IDs so we don't duplicate the related panel
    const exclude = url.searchParams.get("exclude");
    const excludeSet = new Set(exclude ? exclude.split(",") : []);

    const concepts = await getOntologyAdapter().getConceptsForVerse(verse);
    if (concepts.length === 0) {
      return toResponse(ok({ concepts: [] as string[], hadiths: [] as Hadith[] }));
    }

    // Deduplicate and filter concept names
    const conceptNames = [...new Set(concepts.map((c) => c.id))]
      .filter((name) => !BLOCKED_CONCEPTS.has(name) && name.length > 3);

    if (conceptNames.length === 0) {
      return toResponse(ok({ concepts: [] as string[], hadiths: [] as Hadith[] }));
    }

    // Search hadiths using each concept name as a keyword
    const seen = new Set<string>(excludeSet);
    const results: Hadith[] = [];
    const adapter = getHadithAdapter();

    for (const concept of conceptNames) {
      if (results.length >= MAX_RESULTS) break;

      const searchTerm = concept.replace(/-/g, " ");
      const hits = await adapter.searchHadith(searchTerm);
      let added = 0;

      for (const h of hits) {
        const key = `${h.collection}-${h.hadithNumber}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push(h);
        added++;
        if (added >= 5) break;
        if (results.length >= MAX_RESULTS) break;
      }
    }

    const enriched = await enrichHadithTopics(results);
    return toResponse(ok({
      concepts: conceptNames.map((c) => c.replace(/-/g, " ")),
      hadiths: enriched,
    }));
  } catch (error) {
    log.error({ error }, "Concept hadith search failed");
    return toResponse(serverError());
  }
}
