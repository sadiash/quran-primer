import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuranService } from "@/lib/services";
import { ReadingPage } from "@/presentation/components/quran/reading-page";

/** Default translation IDs for SSR (Sahih International, Yusuf Ali, Pickthall) */
const DEFAULT_TRANSLATION_IDS = [20, 85, 131];

interface SurahPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SurahPageProps): Promise<Metadata> {
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

  const result = await getQuranService().getSurahWithMultipleTranslations(
    surahId,
    DEFAULT_TRANSLATION_IDS,
  );
  if (!result) {
    notFound();
  }

  const { surah, translations: translationsByResource } = result;

  // Flatten all translations into a single array for the client
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
