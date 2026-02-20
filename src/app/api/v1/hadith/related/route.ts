import { ok, badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { getHadithAdapter, getOntologyAdapter } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:hadith:related" });

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const verse = url.searchParams.get("verse");

    if (!verse || !/^\d+:\d+$/.test(verse)) {
      return toResponse(badRequest("verse parameter is required (e.g. 2:255)"));
    }

    const ontologyIds = await getOntologyAdapter().getHadithsForVerse(verse);
    if (ontologyIds.length === 0) {
      return toResponse(ok([], { total: 0 }));
    }

    const hadiths = await getHadithAdapter().getHadithsByOntologyIds(ontologyIds);
    return toResponse(ok(hadiths, { total: hadiths.length }));
  } catch (error) {
    log.error({ error }, "Related hadith lookup failed");
    return toResponse(serverError());
  }
}
