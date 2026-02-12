import { ok, badRequest, notFound, serverError, toResponse } from "@/lib/api-helpers";
import { getQuranService } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:tafsir" });

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const verseKey = url.searchParams.get("verse_key");
    const tafsirIdParam = url.searchParams.get("tafsir_id");

    if (!verseKey || !tafsirIdParam) {
      return toResponse(
        badRequest("verse_key and tafsir_id parameters are required"),
      );
    }

    const tafsirId = Number(tafsirIdParam);
    if (!tafsirId) {
      return toResponse(badRequest("tafsir_id must be a number"));
    }

    const tafsir = await getQuranService().getTafsir(verseKey, tafsirId);
    if (!tafsir) {
      return toResponse(notFound("Tafsir not found"));
    }

    return toResponse(ok(tafsir));
  } catch (error) {
    log.error({ error }, "Failed to fetch tafsir");
    return toResponse(serverError());
  }
}
