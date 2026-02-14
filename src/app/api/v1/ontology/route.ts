import { ok, badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { getOntologyAdapter } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:ontology" });

/**
 * GET /api/v1/ontology
 *
 * Query params:
 *   ?type=concepts&verse=2:255  — Quranic concepts for a verse
 *   ?type=concepts              — All Quranic concepts
 *   ?type=hadiths&verse=2:255   — Hadith IDs linked to a verse
 *   ?type=topics                — All topics from the knowledge graph
 *   ?type=topics&hadith=SB-HD0402 — Topics for a specific hadith
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const verse = url.searchParams.get("verse");
    const hadith = url.searchParams.get("hadith");

    const adapter = getOntologyAdapter();

    switch (type) {
      case "concepts": {
        if (verse) {
          const concepts = await adapter.getConceptsForVerse(verse);
          return toResponse(ok(concepts, { total: concepts.length }));
        }
        const concepts = await adapter.getConcepts();
        return toResponse(ok(concepts, { total: concepts.length }));
      }

      case "hadiths": {
        if (!verse) {
          return toResponse(
            badRequest("verse parameter is required for type=hadiths"),
          );
        }
        const hadithIds = await adapter.getHadithsForVerse(verse);
        return toResponse(ok(hadithIds, { total: hadithIds.length }));
      }

      case "topics": {
        if (hadith) {
          const topics = await adapter.getTopicsForHadith(hadith);
          return toResponse(ok(topics, { total: topics.length }));
        }
        const topics = await adapter.getTopics();
        return toResponse(ok(topics, { total: topics.length }));
      }

      default:
        return toResponse(
          badRequest(
            "type parameter is required (concepts, hadiths, or topics)",
          ),
        );
    }
  } catch (error) {
    log.error({ error }, "Ontology query failed");
    return toResponse(serverError());
  }
}
