"use client";

import { useEffect } from "react";
import type { Surah, Verse, Translation } from "@/core/types";
import { useScrollPosition } from "@/presentation/hooks/use-scroll-position";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { SurahHeader } from "./surah-header";
import { ReadingSurface } from "./reading-surface";
import { ReadingToolbar } from "./reading-toolbar";

interface ReadingPageProps {
  surah: Surah;
  verses: Verse[];
  translations: Translation[];
}

export function ReadingPage({ surah, verses, translations }: ReadingPageProps) {
  const scrollRef = useScrollPosition(`surah:${surah.id}`);
  const { preferences } = usePreferences();

  // Scroll to verse from URL hash (e.g., #verse-2:255)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    // Small delay to let the DOM render
    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={scrollRef} className="mx-auto max-w-3xl px-4 py-6">
      <SurahHeader surah={surah} />
      <ReadingToolbar />
      <ReadingSurface
        surahId={surah.id}
        verses={verses}
        translations={translations}
        showArabic={preferences.showArabic}
        translationLayout={preferences.translationLayout}
      />
    </div>
  );
}
