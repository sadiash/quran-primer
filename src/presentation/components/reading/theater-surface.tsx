"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import type { Verse, Translation } from "@/core/types";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { useTheaterGestures } from "@/presentation/hooks/use-theater-gestures";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { TheaterVerse } from "./theater-verse";
import { ReadingToolbar } from "./reading-toolbar";

interface TheaterSurfaceProps {
  surah: { id: number; versesCount: number };
  verses: Verse[];
  translations: Translation[];
}

export function TheaterSurface({ surah, verses, translations }: TheaterSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { preferences, updatePreferences } = usePreferences();
  const audio = useAudioPlayer();
  const [activeIndex, setActiveIndex] = useState(0);

  // Group translations by verse
  const translationsByVerse = useMemo(() => {
    const byVerse = new Map<string, Translation[]>();
    for (const t of translations) {
      if (!preferences.activeTranslationIds.includes(t.resourceId)) continue;
      const existing = byVerse.get(t.verseKey) ?? [];
      existing.push(t);
      byVerse.set(t.verseKey, existing);
    }
    return byVerse;
  }, [translations, preferences.activeTranslationIds]);

  // Windowed rendering: only render current +/- 2 verses for performance
  const windowSize = 2;
  const renderedVerses = useMemo(() => {
    const start = Math.max(0, activeIndex - windowSize);
    const end = Math.min(verses.length, activeIndex + windowSize + 1);
    return verses.slice(start, end).map((v, i) => ({
      verse: v,
      globalIndex: start + i,
    }));
  }, [verses, activeIndex]);

  // Track which verse is in view via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const key = (entry.target as HTMLElement).dataset.verseKey;
            if (key) {
              const idx = verses.findIndex((v) => v.verseKey === key);
              if (idx !== -1) setActiveIndex(idx);
            }
          }
        }
      },
      { root: container, threshold: 0.5 },
    );

    const slides = container.querySelectorAll("[data-verse-key]");
    slides.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [verses, renderedVerses]);

  const scrollToIndex = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(verses.length - 1, idx));
      setActiveIndex(clamped);
      const container = containerRef.current;
      if (!container) return;
      const target = container.querySelector(
        `[data-verse-key="${verses[clamped]?.verseKey}"]`,
      );
      target?.scrollIntoView({ behavior: "smooth" });
    },
    [verses],
  );

  const goNext = useCallback(() => scrollToIndex(activeIndex + 1), [activeIndex, scrollToIndex]);
  const goPrev = useCallback(() => scrollToIndex(activeIndex - 1), [activeIndex, scrollToIndex]);
  const exitTheater = useCallback(() => {
    updatePreferences({ readingFlow: "blocks" });
  }, [updatePreferences]);

  useTheaterGestures({ onNext: goNext, onPrev: goPrev, onExit: exitTheater });

  // Sync with audio player
  useEffect(() => {
    if (audio.currentVerseKey) {
      const idx = verses.findIndex((v) => v.verseKey === audio.currentVerseKey);
      if (idx !== -1 && idx !== activeIndex) {
        scrollToIndex(idx);
      }
    }
  }, [audio.currentVerseKey, verses, activeIndex, scrollToIndex]);

  return (
    <div className="relative h-full">
      {/* Scroll-snap container */}
      <div ref={containerRef} className="theater-container">
        {/* Spacer slides for windowed rendering */}
        {activeIndex > windowSize && (
          <div style={{ height: `${(activeIndex - windowSize) * 100}dvh` }} />
        )}

        {renderedVerses.map(({ verse, globalIndex }) => (
          <TheaterVerse
            key={verse.verseKey}
            verse={verse}
            translations={translationsByVerse.get(verse.verseKey) ?? []}
            showArabic={preferences.showArabic}
            showTranslation={preferences.showTranslation}
            isActive={globalIndex === activeIndex}
          />
        ))}

        {/* Trailing spacer */}
        {activeIndex + windowSize + 1 < verses.length && (
          <div style={{ height: `${(verses.length - activeIndex - windowSize - 1) * 100}dvh` }} />
        )}
      </div>

      {/* Verse counter */}
      <div className="theater-counter">
        {activeIndex + 1} / {verses.length}
      </div>

      {/* Dot navigation (only show for surahs with ≤ 100 verses) */}
      {verses.length <= 100 && (
        <div className="theater-dots">
          {verses.map((v, i) => (
            <button
              key={v.verseKey}
              className={`theater-dot ${i === activeIndex ? "theater-dot-active" : ""}`}
              onClick={() => scrollToIndex(i)}
              aria-label={`Verse ${v.verseNumber}`}
            />
          ))}
        </div>
      )}

      <ReadingToolbar />
    </div>
  );
}
