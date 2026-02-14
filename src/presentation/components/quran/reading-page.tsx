"use client";

import type { Surah, Verse, Translation } from "@/core/types";
import { ReadingSurface } from "@/presentation/components/reading/reading-surface";

export interface ConceptTag {
  id: string;
  name: string;
}

interface ReadingPageProps {
  surah: Surah;
  verses: Verse[];
  translations: Translation[];
  conceptsByVerse?: Record<string, ConceptTag[]>;
}

export function ReadingPage({ surah, verses, translations, conceptsByVerse }: ReadingPageProps) {
  return (
    <ReadingSurface
      surah={surah}
      verses={verses}
      translations={translations}
      conceptsByVerse={conceptsByVerse}
    />
  );
}
