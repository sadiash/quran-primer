import { ok, badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { getQuranService } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:audio" });

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const surahIdParam = url.searchParams.get("surah_id");
    const reciterIdParam = url.searchParams.get("reciter_id");

    if (!surahIdParam || !reciterIdParam) {
      return toResponse(
        badRequest("surah_id and reciter_id parameters are required"),
      );
    }

    const surahId = Number(surahIdParam);
    const reciterId = Number(reciterIdParam);

    if (!surahId || !reciterId) {
      return toResponse(badRequest("surah_id and reciter_id must be numbers"));
    }

    const recitations = await getQuranService().getRecitation(
      surahId,
      reciterId,
    );
    return toResponse(ok(recitations));
  } catch (error) {
    log.error({ error }, "Failed to fetch audio");
    return toResponse(serverError());
  }
}
