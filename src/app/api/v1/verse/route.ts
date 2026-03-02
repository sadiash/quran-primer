import { ok, badRequest, notFound, serverError, toResponse } from "@/lib/api-helpers";
import { getQuranService } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:verse" });

/**
 * GET /api/v1/verse?key=2:255
 *
 * Returns a single verse with Arabic text, translation, and surah name.
 * Optional: &translation=1001 (defaults to Mustafa Khattab)
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    const translationId = Number(url.searchParams.get("translation") ?? "1001");

    if (!key || !/^\d+:\d+$/.test(key)) {
      return toResponse(badRequest("key parameter is required (e.g. 2:255)"));
    }

    const quranService = getQuranService();

    const [result, surahs] = await Promise.all([
      quranService.getVerseWithTranslation(key, translationId),
      quranService.getAllSurahs(),
    ]);

    if (!result) {
      return toResponse(notFound(`Verse ${key} not found`));
    }

    const surahId = Number(key.split(":")[0]);
    const surah = surahs.find((s) => s.id === surahId);

    return toResponse(
      ok({
        verseKey: result.verse.verseKey,
        textUthmani: result.verse.textUthmani,
        translation: result.translation?.text ?? null,
        surahName: surah?.nameSimple ?? null,
        surahNameArabic: surah?.nameArabic ?? null,
      }),
    );
  } catch (error) {
    log.error({ error }, "Verse lookup failed");
    return toResponse(serverError());
  }
}
