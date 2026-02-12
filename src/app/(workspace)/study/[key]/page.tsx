import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuranService } from "@/lib/services";
import { StudyView } from "@/presentation/components/study";

interface StudyPageProps {
  params: Promise<{ key: string }>;
}

function parseVerseKey(key: string): { surahId: number; verseNumber: number } | null {
  const match = key.match(/^(\d+):(\d+)$/);
  if (!match) return null;
  const surahId = Number(match[1]);
  const verseNumber = Number(match[2]);
  if (surahId < 1 || surahId > 114 || verseNumber < 1) return null;
  return { surahId, verseNumber };
}

export async function generateMetadata({
  params,
}: StudyPageProps): Promise<Metadata> {
  const { key } = await params;
  const parsed = parseVerseKey(key);

  if (!parsed) {
    return { title: "Verse Not Found — The Primer" };
  }

  const surahs = await getQuranService().getAllSurahs();
  const surah = surahs.find((s) => s.id === parsed.surahId);

  return {
    title: surah
      ? `Study ${surah.nameSimple} ${key} — The Primer`
      : "Verse Not Found — The Primer",
  };
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { key } = await params;
  const parsed = parseVerseKey(key);

  if (!parsed) {
    notFound();
  }

  const [verse, surahs] = await Promise.all([
    getQuranService().getVerse(key),
    getQuranService().getAllSurahs(),
  ]);

  if (!verse) {
    notFound();
  }

  const surah = surahs.find((s) => s.id === parsed.surahId);
  if (!surah) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <StudyView verse={verse} surah={surah} />
    </div>
  );
}
