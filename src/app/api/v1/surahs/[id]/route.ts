import { ok, badRequest, notFound, serverError, toResponse } from "@/lib/api-helpers";
import { getQuranService } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:surahs:[id]" });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const surahId = Number(id);

    if (!surahId || surahId < 1 || surahId > 114) {
      return toResponse(badRequest("surahId must be between 1 and 114"));
    }

    const url = new URL(request.url);
    const translationParam = url.searchParams.get("translation");

    if (translationParam) {
      const translationId = Number(translationParam);
      if (!translationId) {
        return toResponse(badRequest("translation must be a number"));
      }

      const result = await getQuranService().getSurahWithTranslation(
        surahId,
        translationId,
      );
      if (!result) {
        return toResponse(notFound("Surah not found"));
      }
      return toResponse(ok(result));
    }

    const surah = await getQuranService().getSurah(surahId);
    if (!surah) {
      return toResponse(notFound("Surah not found"));
    }

    return toResponse(ok(surah));
  } catch (error) {
    log.error({ error }, "Failed to fetch surah");
    return toResponse(serverError());
  }
}
