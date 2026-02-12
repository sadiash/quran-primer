import { ok, badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { getHadithAdapter } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:hadith" });

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const collection = url.searchParams.get("collection") ?? undefined;

    if (!q || !q.trim()) {
      return toResponse(badRequest("q parameter is required"));
    }

    const results = await getHadithAdapter().searchHadith(q, collection);
    return toResponse(ok(results, { total: results.length }));
  } catch (error) {
    log.error({ error }, "Hadith search failed");
    return toResponse(serverError());
  }
}
