"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Surah, Verse, Translation } from "@/core/types";
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
  const { updateProgress } = useProgress(surah.id);
  const { isBookmarked, toggleBookmark } = useBookmarks(surah.id);
  const { notes } = useNotes({ forSurahReading: surah.id });
  const audio = useAudioPlayer();
  const { observerRef, getCurrentVerseKey } = useVerseVisibility();
  const containerRef = useRef<HTMLDivElement>(null);

  // Manual focus — used for clicks, keyboard nav, and verse action menus.
  // The scroll-based poll only saves progress and never overrides this.
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
      // Verse-level: only verseKeys matching this surah
      for (const vk of n.verseKeys) {
        if (vk.startsWith(prefix)) keys.add(vk);
      }
      // Surah-level: mark all verses
      if (n.surahIds.includes(surah.id)) {
        for (const v of verses) keys.add(v.verseKey);
      }
    }
    return keys;
  }, [notes, surah.id, verses]);

  // Resolve per-translation configs (order, font size, color)
  const resolvedConfigs = useMemo(
    () =>
      getResolvedTranslationConfigs(
        preferences.activeTranslationIds,
        preferences.translationConfigs,
        preferences.translationFontSize,
      ),
    [preferences.activeTranslationIds, preferences.translationConfigs, preferences.translationFontSize],
  );

  // Filter translations to user's active selection
  const activeTranslations = translations.filter((t) =>
    preferences.activeTranslationIds.includes(t.resourceId),
  );

  // Group translations by verse, sorted by config order
  const translationsByVerse = useMemo(() => {
    const configOrderMap = new Map<number, number>();
    for (const c of resolvedConfigs) configOrderMap.set(c.translationId, c.order);

    const byVerse = new Map<string, Translation[]>();
    for (const t of activeTranslations) {
      const existing = byVerse.get(t.verseKey) ?? [];
      existing.push(t);
      byVerse.set(t.verseKey, existing);
    }

    // Sort each verse's translations by config order
    for (const [key, arr] of byVerse) {
      arr.sort((a, b) => (configOrderMap.get(a.resourceId) ?? 0) - (configOrderMap.get(b.resourceId) ?? 0));
      byVerse.set(key, arr);
    }

    return byVerse;
  }, [activeTranslations, resolvedConfigs]);

  // Track reading progress (scroll-based — does NOT override manual verse focus)
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveProgress = useCallback(
    (verseKey: string, verseNumber: number) => {
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
    [updateProgress, surah.id, surah.versesCount],
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

  // Poll observer for current visible verse — only updates reading progress, never steals focus
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

    // Small delay to let DOM render
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

  // Keyboard shortcuts: j/k/b/t/n/Z/Escape + arrows
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if inside input/textarea/contenteditable or modifier keys held
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
      } else if (e.key === "Z") {
        e.preventDefault();
        updatePreferences({ zenMode: !preferences.zenMode });
      } else if (e.key === "Escape" && preferences.zenMode) {
        e.preventDefault();
        updatePreferences({ zenMode: false });
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedVerseKey, verses, focusVerseManually, toggleBookmark, surah.id, openPanel, preferences.zenMode, updatePreferences]);

  const density = preferences.readingDensity;
  const readingFlow = preferences.readingFlow ?? "blocks";
  const isProse = readingFlow === "prose";
  const dividerClass = isProse
    ? ""
    : density === "dense"
      ? ""
      : density === "compact"
        ? "divide-y divide-border/10"
        : "divide-y divide-border/20";

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth"
      >
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          {preferences.showSurahHeaders && (
            <SurahHeader surah={surah} showBismillah={preferences.showBismillah} />
          )}

          {/* Translation color legend — only when multiple translations active */}
          {resolvedConfigs.length > 1 && preferences.showTranslation && (
            <TranslationLegend
              configs={resolvedConfigs}
              translations={activeTranslations}
            />
          )}

          <div className={cn(
            "mt-4 space-y-0",
            dividerClass,
            isProse && (preferences.showArabic ? "prose-container" : "prose-container-ltr"),
          )}>
            {verses.map((verse) => (
              <VerseBlock
                key={verse.verseKey}
                verse={verse}
                translations={translationsByVerse.get(verse.verseKey) ?? []}
                showArabic={preferences.showArabic}
                showTranslation={preferences.showTranslation}
                showVerseNumbers={preferences.showVerseNumbers}
                arabicSizeClass={arabicSizeClass}
                translationConfigs={resolvedConfigs}
                translationLayout={preferences.translationLayout}
                density={density}
                readingFlow={readingFlow}
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
          <div className="h-32" />
        </div>
      </div>

      <ReadingToolbar />
    </div>
  );
}

/* ─── Translation color legend ─── */

import type { TranslationConfig } from "@/core/types";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function TranslationLegend({
  configs,
  translations,
}: {
  configs: TranslationConfig[];
  translations: Translation[];
}) {
  const [open, setOpen] = useState(true);

  // Build a name lookup from the translations we received
  const nameMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const t of translations) {
      if (!m.has(t.resourceId)) m.set(t.resourceId, t.resourceName);
    }
    return m;
  }, [translations]);

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 hover:text-muted-foreground transition-fast"
      >
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            !open && "-rotate-90",
          )}
        />
        {open ? "Hide" : "Show"} translation key
      </button>
      {open && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          {configs.map((c) => (
            <span key={c.translationId} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: `hsl(var(--translation-${c.colorSlot}))` }}
              />
              <span className="text-muted-foreground">
                {nameMap.get(c.translationId) ?? `Translation ${c.translationId}`}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
