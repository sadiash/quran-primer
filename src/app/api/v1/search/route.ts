import { ok, badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { getQuranService } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:search" });

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");

    if (!q || !q.trim()) {
      return toResponse(badRequest("q parameter is required"));
    }

    const results = await getQuranService().searchQuran(q);
    return toResponse(ok(results, { total: results.length }));
  } catch (error) {
    log.error({ error }, "Search failed");
    return toResponse(serverError());
  }
}
