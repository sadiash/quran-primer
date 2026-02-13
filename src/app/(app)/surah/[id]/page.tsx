import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuranService } from "@/lib/services";
import { ReadingPage } from "@/presentation/components/quran/reading-page";

/** All 6 bundled translations — loaded server-side from local files (fast). */
const ALL_BUNDLED_TRANSLATION_IDS = [1001, 1002, 1003, 1004, 1005, 1006];

interface SurahPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SurahPageProps): Promise<Metadata> {
  const { id } = await params;
  const surahId = Number(id);

  if (!surahId || surahId < 1 || surahId > 114) {
    return { title: "Surah Not Found — The Primer" };
  }

  const surahs = await getQuranService().getAllSurahs();
  const surah = surahs.find((s) => s.id === surahId);

  return {
    title: surah
      ? `${surah.nameSimple} — The Primer`
      : "Surah Not Found — The Primer",
  };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { id } = await params;
  const surahId = Number(id);

  if (!surahId || surahId < 1 || surahId > 114) {
    notFound();
  }

  // Load ALL bundled translations — client-side filters to user's activeTranslationIds
  const result = await getQuranService().getSurahWithMultipleTranslations(
    surahId,
    ALL_BUNDLED_TRANSLATION_IDS,
  );

  if (!result) {
    notFound();
  }

  const { surah, translations: translationsByResource } = result;
  const allTranslations = Object.values(translationsByResource).flat();

  return (
    <ReadingPage
      surah={{
        id: surah.id,
        nameArabic: surah.nameArabic,
        nameSimple: surah.nameSimple,
        nameComplex: surah.nameComplex,
        nameTranslation: surah.nameTranslation,
        revelationType: surah.revelationType,
        versesCount: surah.versesCount,
      }}
      verses={surah.verses}
      translations={allTranslations}
    />
  );
}
