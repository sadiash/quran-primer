"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Surah, Verse, Translation, TranslationConfig } from "@/core/types";
import type { ConceptTag } from "@/presentation/components/quran/reading-page";
import { getResolvedTranslationConfigs } from "@/core/types";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useProgress } from "@/presentation/hooks/use-progress";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { useNotes } from "@/presentation/hooks/use-notes";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { useVerseVisibility } from "@/presentation/hooks/use-verse-visibility";
import { SurahHeader } from "./surah-header";
import { VerseBlock } from "./verse-block";
import { ReadingToolbar } from "./reading-toolbar";
import { ReadingProgressBar } from "./reading-progress-bar";
import { cn } from "@/lib/utils";

interface ReadingSurfaceProps {
  surah: Surah;
  verses: Verse[];
  translations: Translation[];
  conceptsByVerse?: Record<string, ConceptTag[]>;
}

export function ReadingSurface({
  surah,
  verses,
  translations,
  conceptsByVerse,
}: ReadingSurfaceProps) {
  const searchParams = useSearchParams();
  const { preferences, updatePreferences } = usePreferences();
  const { focusVerse, focusedVerseKey, openPanel } = usePanels();
  const { progress, updateProgress } = useProgress(surah.id);
  const { isBookmarked, toggleBookmark } = useBookmarks(surah.id);
  const { notes } = useNotes({ forSurahReading: surah.id });
  const audio = useAudioPlayer();
  const { observerRef, getCurrentVerseKey } = useVerseVisibility();
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position for collapsing surah header
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const isHeaderCompactRef = useRef(false);

  // Manual focus
  const focusVerseManually = useCallback(
    (key: string) => {
      focusVerse(key);
    },
    [focusVerse],
  );

  // Derive set of verse keys that have notes
  const noteVerseKeys = useMemo(() => {
    const keys = new Set<string>();
    const prefix = `${surah.id}:`;
    for (const n of notes) {
      for (const vk of n.verseKeys) {
        if (vk.startsWith(prefix)) keys.add(vk);
      }
      if (n.surahIds.includes(surah.id)) {
        for (const v of verses) keys.add(v.verseKey);
      }
    }
    return keys;
  }, [notes, surah.id, verses]);

  // Resolve per-translation configs
  const resolvedConfigs = useMemo(
    () =>
      getResolvedTranslationConfigs(
        preferences.activeTranslationIds,
        preferences.translationConfigs,
        preferences.translationFontSize,
      ),
    [preferences.activeTranslationIds, preferences.translationConfigs, preferences.translationFontSize],
  );

  // Visible translations
  const visibleTranslationIds = useMemo(() => {
    const saved = preferences.visibleTranslationIds;
    if (!saved) return preferences.activeTranslationIds;
    const valid = saved.filter((id) => preferences.activeTranslationIds.includes(id));
    return valid.length > 0 ? valid : preferences.activeTranslationIds;
  }, [preferences.visibleTranslationIds, preferences.activeTranslationIds]);

  const toggleVisibleTranslation = useCallback((id: number) => {
    const next = visibleTranslationIds.includes(id)
      ? visibleTranslationIds.length > 1 ? visibleTranslationIds.filter((x) => x !== id) : visibleTranslationIds
      : [...visibleTranslationIds, id];
    updatePreferences({ visibleTranslationIds: next });
  }, [visibleTranslationIds, updatePreferences]);

  // Filter translations to visible selection
  const activeTranslations = useMemo(
    () => translations.filter((t) => visibleTranslationIds.includes(t.resourceId)),
    [translations, visibleTranslationIds],
  );

  const visibleConfigs = useMemo(
    () => resolvedConfigs.filter((c) => visibleTranslationIds.includes(c.translationId)),
    [resolvedConfigs, visibleTranslationIds],
  );

  // Group translations by verse
  const translationsByVerse = useMemo(() => {
    const configOrderMap = new Map<number, number>();
    for (const c of visibleConfigs) configOrderMap.set(c.translationId, c.order);

    const byVerse = new Map<string, Translation[]>();
    for (const t of activeTranslations) {
      const existing = byVerse.get(t.verseKey) ?? [];
      existing.push(t);
      byVerse.set(t.verseKey, existing);
    }

    for (const [key, arr] of byVerse) {
      arr.sort((a, b) => (configOrderMap.get(a.resourceId) ?? 0) - (configOrderMap.get(b.resourceId) ?? 0));
      byVerse.set(key, arr);
    }

    return byVerse;
  }, [activeTranslations, visibleConfigs]);

  // Track reading progress — only ever increase completedVerses
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const maxVerseRef = useRef(progress?.completedVerses ?? 0);
  if (progress && progress.completedVerses > maxVerseRef.current) {
    maxVerseRef.current = progress.completedVerses;
  }
  const saveProgress = useCallback(
    (verseKey: string, verseNumber: number) => {
      if (!preferences.trackProgress) return;
      if (verseNumber > maxVerseRef.current) {
        maxVerseRef.current = verseNumber;
      }
      clearTimeout(saveProgressTimer.current);
      saveProgressTimer.current = setTimeout(() => {
        updateProgress({
          surahId: surah.id,
          lastVerseKey: verseKey,
          lastVerseNumber: verseNumber,
          completedVerses: maxVerseRef.current,
          totalVerses: surah.versesCount,
          updatedAt: new Date(),
        });
      }, 2000);
    },
    [updateProgress, surah.id, surah.versesCount, preferences.trackProgress],
  );

  // Collapse surah header when scrolled
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const shouldBeCompact = container.scrollTop > 80;
      if (shouldBeCompact !== isHeaderCompactRef.current) {
        isHeaderCompactRef.current = shouldBeCompact;
        setIsHeaderCompact(shouldBeCompact);
      }
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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
        saveProgress(key, Number(num));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [getCurrentVerseKey, saveProgress]);

  // Scroll to verse from ?verse= query param on mount
  const scrolledToParam = useRef(false);
  useEffect(() => {
    if (scrolledToParam.current) return;
    const verseParam = searchParams.get("verse");
    if (!verseParam) return;

    const timer = setTimeout(() => {
      const el = containerRef.current?.querySelector(
        `[data-verse-key="${verseParam}"]`,
      );
      if (el) {
        scrolledToParam.current = true;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        focusVerseManually(verseParam);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchParams, focusVerseManually]);

  const arabicSizeClass = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
    "2xl": "text-5xl",
  }[preferences.arabicFontSize];

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      const currentIdx = focusedVerseKey
        ? verses.findIndex((v) => v.verseKey === focusedVerseKey)
        : -1;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        const nextIdx = Math.min(currentIdx + 1, verses.length - 1);
        const next = verses[nextIdx];
        if (next) {
          focusVerseManually(next.verseKey);
          containerRef.current
            ?.querySelector(`[data-verse-key="${next.verseKey}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        const prevIdx = Math.max(currentIdx - 1, 0);
        const prev = verses[prevIdx];
        if (prev) {
          focusVerseManually(prev.verseKey);
          containerRef.current
            ?.querySelector(`[data-verse-key="${prev.verseKey}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (e.key === "b" && focusedVerseKey) {
        e.preventDefault();
        toggleBookmark(focusedVerseKey, surah.id);
      } else if (e.key === "t") {
        e.preventDefault();
        openPanel("tafsir");
      } else if (e.key === "n") {
        e.preventDefault();
        openPanel("notes");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedVerseKey, verses, focusVerseManually, toggleBookmark, surah.id, openPanel, updatePreferences]);

  return (
    <div className="relative h-full flex flex-col">
      {/* Reading progress bar */}
      <ReadingProgressBar containerRef={containerRef} />

      {/* Sticky surah header */}
      {preferences.showSurahHeaders && (
        <div className={cn(
          "shrink-0 border-b border-border bg-background transition-all duration-200",
        )}>
          <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-12">
            <SurahHeader surah={surah} compact={isHeaderCompact} />
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto scroll-smooth"
      >
        <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8 lg:px-12">
          {/* Bismillah — colored editorial strip */}
          {preferences.showBismillah && surah.id !== 1 && surah.id !== 9 && (
            <div className="mb-8 -mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12 py-6 text-center" style={{ backgroundColor: "var(--br-accent-yellow)", color: "#0a0a0a" }}>
              <p
                lang="ar"
                dir="rtl"
                className="arabic-display text-2xl sm:text-3xl"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] mt-2 block opacity-50">
                In the name of God, the Most Gracious, the Most Merciful
              </span>
            </div>
          )}

          {/* Translation legend — color swatches */}
          {visibleConfigs.length > 1 && preferences.showTranslation && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {visibleConfigs.map((c) => {
                const name = translations.find((t) => t.resourceId === c.translationId)?.resourceName;
                return (
                  <span
                    key={c.translationId}
                    className="inline-flex items-center gap-2 border-l-3 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider"
                    style={{
                      borderLeftWidth: "3px",
                      borderLeftStyle: "solid",
                      borderLeftColor: `var(--translation-${c.colorSlot}-border)`,
                      backgroundColor: `var(--translation-${c.colorSlot}-bg)`,
                      color: `var(--translation-${c.colorSlot}-label)`,
                    }}
                  >
                    {name ?? `Translation ${c.translationId}`}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-4 space-y-0">
            {verses.map((verse) => (
              <VerseBlock
                key={verse.verseKey}
                verse={verse}
                translations={translationsByVerse.get(verse.verseKey) ?? []}
                showArabic={preferences.showArabic}
                showTranslation={preferences.showTranslation}
                showVerseNumbers={preferences.showVerseNumbers}
                arabicSizeClass={arabicSizeClass}
                translationConfigs={visibleConfigs}
                translationLayout={preferences.translationLayout}
                isFocused={focusedVerseKey === verse.verseKey}
                isBookmarked={isBookmarked(verse.verseKey)}
                isPlaying={audio.currentVerseKey === verse.verseKey && audio.isPlaying}
                hasNotes={noteVerseKeys.has(verse.verseKey)}
                onToggleBookmark={() => toggleBookmark(verse.verseKey, surah.id)}
                onTogglePlay={() => {
                  if (audio.currentVerseKey === verse.verseKey && audio.isPlaying) {
                    audio.pause();
                  } else if (audio.currentVerseKey === verse.verseKey && !audio.isPlaying) {
                    audio.resume();
                  } else {
                    audio.play(verse.verseKey, surah.id);
                  }
                }}
                onFocus={() => focusVerseManually(verse.verseKey)}
                onOpenNotes={() => { focusVerseManually(verse.verseKey); openPanel("notes"); }}
                onOpenStudy={() => { focusVerseManually(verse.verseKey); openPanel("tafsir"); }}
                onSwipeRight={() => toggleBookmark(verse.verseKey, surah.id)}
                concepts={preferences.showConcepts ? (conceptsByVerse?.[verse.verseKey] ?? []) : []}
                conceptMaxVisible={preferences.conceptMaxVisible}
                conceptColorSlot={preferences.conceptColorSlot}
              />
            ))}
          </div>

          {/* End spacer */}
          <div className="h-32 md:h-24" />
        </div>
      </div>

      <ReadingToolbar
        visibleTranslationIds={visibleTranslationIds}
        onToggleTranslation={toggleVisibleTranslation}
      />
    </div>
  );
}
