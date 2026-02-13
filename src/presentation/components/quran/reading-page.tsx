"use client";

import type { Surah, Verse, Translation } from "@/core/types";
import { ReadingSurface } from "@/presentation/components/reading/reading-surface";

interface ReadingPageProps {
  surah: Surah;
  verses: Verse[];
  translations: Translation[];
}

export function ReadingPage({ surah, verses, translations }: ReadingPageProps) {
  return (
    <ReadingSurface
      surah={surah}
      verses={verses}
      translations={translations}
    />
  );
}
