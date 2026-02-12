import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuranService } from "@/lib/services";
import { ReadingPage } from "@/presentation/components/quran/reading-page";

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

  const result = await getQuranService().getSurahWithTranslation(surahId, 20);
  if (!result) {
    notFound();
  }

  const { surah, translations } = result;

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
      translations={translations}
    />
  );
}
