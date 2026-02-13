"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Surah, Verse, Translation } from "@/core/types";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useProgress } from "@/presentation/hooks/use-progress";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { useVerseVisibility } from "@/presentation/hooks/use-verse-visibility";
import { SurahHeader } from "./surah-header";
import { VerseBlock } from "./verse-block";
import { ReadingToolbar } from "./reading-toolbar";

interface ReadingSurfaceProps {
  surah: Surah;
  verses: Verse[];
  translations: Translation[];
}

export function ReadingSurface({
  surah,
  verses,
  translations,
}: ReadingSurfaceProps) {
  const { preferences } = usePreferences();
  const { focusVerse, focusedVerseKey } = usePanels();
  const { updateProgress } = useProgress(surah.id);
  const { isBookmarked, toggleBookmark } = useBookmarks(surah.id);
  const audio = useAudioPlayer();
  const { observerRef, getCurrentVerseKey } = useVerseVisibility();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter translations to user's active selection
  const activeTranslations = translations.filter((t) =>
    preferences.activeTranslationIds.includes(t.resourceId),
  );

  // Group translations by verse
  const translationsByVerse = new Map<string, Translation[]>();
  for (const t of activeTranslations) {
    const existing = translationsByVerse.get(t.verseKey) ?? [];
    existing.push(t);
    translationsByVerse.set(t.verseKey, existing);
  }

  // Track reading progress
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleVerseVisible = useCallback(
    (verseKey: string, verseNumber: number) => {
      focusVerse(verseKey);
      clearTimeout(saveProgressTimer.current);
      saveProgressTimer.current = setTimeout(() => {
        updateProgress({
          surahId: surah.id,
          lastVerseKey: verseKey,
          lastVerseNumber: verseNumber,
          completedVerses: verseNumber,
          totalVerses: surah.versesCount,
          updatedAt: new Date(),
        });
      }, 2000);
    },
    [focusVerse, updateProgress, surah.id, surah.versesCount],
  );

  // Register verse elements with IntersectionObserver
  useEffect(() => {
    const observer = observerRef.current;
    const container = containerRef.current;
    if (!observer || !container) return;

    const verseEls = container.querySelectorAll("[data-verse-key]");
    verseEls.forEach((el) => observer.observe(el));

    return () => {
      verseEls.forEach((el) => observer.unobserve(el));
    };
  }, [observerRef, verses]);

  // Poll observer for current visible verse
  useEffect(() => {
    const interval = setInterval(() => {
      const key = getCurrentVerseKey();
      if (key) {
        const [, num] = key.split(":");
        handleVerseVisible(key, Number(num));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getCurrentVerseKey, handleVerseVisible]);

  const arabicSizeClass = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
    "2xl": "text-5xl",
  }[preferences.arabicFontSize];

  const translationSizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[preferences.translationFontSize];

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth"
      >
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <SurahHeader surah={surah} />

          <div className="mt-8 space-y-0 divide-y divide-border/30">
            {verses.map((verse) => (
              <VerseBlock
                key={verse.verseKey}
                verse={verse}
                translations={translationsByVerse.get(verse.verseKey) ?? []}
                showArabic={preferences.showArabic}
                showTranslation={preferences.showTranslation}
                arabicSizeClass={arabicSizeClass}
                translationSizeClass={translationSizeClass}
                translationLayout={preferences.translationLayout}
                isFocused={focusedVerseKey === verse.verseKey}
                isBookmarked={isBookmarked(verse.verseKey)}
                isPlaying={audio.currentVerseKey === verse.verseKey && audio.isPlaying}
                onToggleBookmark={() => toggleBookmark(verse.verseKey, surah.id)}
                onPlay={() => audio.play(verse.verseKey, surah.id)}
                onFocus={() => focusVerse(verse.verseKey)}
              />
            ))}
          </div>

          {/* End spacer */}
          <div className="h-32" />
        </div>
      </div>

      <ReadingToolbar />
    </div>
  );
}
