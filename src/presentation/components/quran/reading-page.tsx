"use client";

import type { Surah, Verse, Translation } from "@/core/types";
import { useScrollPosition } from "@/presentation/hooks/use-scroll-position";
import { SurahHeader } from "./surah-header";
import { ReadingSurface } from "./reading-surface";

interface ReadingPageProps {
  surah: Surah;
  verses: Verse[];
  translations: Translation[];
}

export function ReadingPage({ surah, verses, translations }: ReadingPageProps) {
  const scrollRef = useScrollPosition(`surah:${surah.id}`);

  return (
    <div ref={scrollRef} className="mx-auto max-w-3xl px-4 py-6">
      <SurahHeader surah={surah} />
      <ReadingSurface
        surahId={surah.id}
        verses={verses}
        translations={translations}
      />
    </div>
  );
}
