import { ok, badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { getCrossReferenceAdapter } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:cross-references" });

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const verseKey = url.searchParams.get("verse_key");
    const query = url.searchParams.get("q");

    if (!verseKey && !query) {
      return toResponse(
        badRequest("Either verse_key or q parameter is required"),
      );
    }

    const adapter = getCrossReferenceAdapter();

    if (verseKey) {
      // Validate verse key format: "surah:verse"
      if (!/^\d{1,3}:\d{1,3}$/.test(verseKey)) {
        return toResponse(
          badRequest("verse_key must be in format 'surah:verse' (e.g. 2:247)"),
        );
      }

      const clusters = await adapter.getCrossReferences(verseKey);
      return toResponse(ok(clusters, { total: clusters.length }));
    }

    // Search mode
    const clusters = await adapter.searchCrossReferences(query!);
    return toResponse(ok(clusters, { total: clusters.length }));
  } catch (error) {
    log.error({ error }, "Failed to fetch cross-references");
    return toResponse(serverError());
  }
}
