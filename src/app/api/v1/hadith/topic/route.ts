import { ok, badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { getHadithAdapter, getOntologyAdapter } from "@/lib/services";
import { enrichHadithTopics } from "@/lib/enrich-hadith-topics";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:hadith:topic" });

/**
 * GET /api/v1/hadith/topic?name=Salah&limit=20&offset=0
 *
 * Returns paginated hadiths for a given topic name.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get("name");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);
    const offset = Number(url.searchParams.get("offset") ?? "0");

    if (!name) {
      return toResponse(badRequest("name parameter is required (e.g. Salah)"));
    }

    const ontologyAdapter = getOntologyAdapter();
    const hadithAdapter = getHadithAdapter();

    // Get all hadith IDs for this topic
    const allIds = await ontologyAdapter.getHadithIdsByTopic(name);

    if (allIds.length === 0) {
      return toResponse(ok([], { total: 0 }));
    }

    // Paginate the IDs
    const pageIds = allIds.slice(offset, offset + limit);

    // Resolve to full hadith objects
    const hadiths = await hadithAdapter.getHadithsByOntologyIds(pageIds);
    const enriched = await enrichHadithTopics(hadiths);

    return toResponse(ok(enriched, { total: allIds.length }));
  } catch (error) {
    log.error({ error }, "Topic hadith lookup failed");
    return toResponse(serverError());
  }
}
