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
import { useFocusSpotlight } from "@/presentation/hooks/use-focus-spotlight";
import { SurahHeader, VineBorder } from "./surah-header";
import { VerseBlock } from "./verse-block";
import { ReadingToolbar } from "./reading-toolbar";
import { ReadingProgressBar } from "./reading-progress-bar";
import { TheaterSurface } from "./theater-surface";
import { MushafSurface } from "./mushaf-surface";

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

  const readingFlow = preferences.readingFlow ?? "blocks";

  // Track scroll position for collapsing surah header
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const isHeaderCompactRef = useRef(false);

  // Focus spotlight hook (active for all modes but only applied to "focus" flow)
  const { getFocusClass } = useFocusSpotlight(containerRef);

  // Verse keys list for focus mode distance calculation
  const verseKeys = useMemo(() => verses.map((v) => v.verseKey), [verses]);

  // Manual focus — used for clicks, keyboard nav, and verse action menus.
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
  const activeTranslations = useMemo(
    () => translations.filter((t) => preferences.activeTranslationIds.includes(t.resourceId)),
    [translations, preferences.activeTranslationIds],
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
    // Theater/mushaf have their own keyboard handlers
    if (readingFlow === "theater" || readingFlow === "mushaf") return;

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
  }, [readingFlow, focusedVerseKey, verses, focusVerseManually, toggleBookmark, surah.id, openPanel, preferences.zenMode, updatePreferences]);

  const density = preferences.readingDensity;
  const isProse = readingFlow === "prose";
  const isFocus = readingFlow === "focus";

  // ── Route to Theater Mode ──
  if (readingFlow === "theater") {
    return (
      <TheaterSurface
        surah={surah}
        verses={verses}
        translations={translations}
      />
    );
  }

  // ── Route to Mushaf Mode ──
  if (readingFlow === "mushaf") {
    return (
      <MushafSurface
        surah={surah}
        verses={verses}
        translations={translations}
      />
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Decorative vine borders — visible on wide screens */}
      <VineBorder side="left" />
      <VineBorder side="right" />

      {/* Reading progress bar */}
      <ReadingProgressBar containerRef={containerRef} />

      {/* Sticky surah header — collapses when scrolled */}
      {preferences.showSurahHeaders && (
        <div className={cn(
          "shrink-0 border-b border-border/40 bg-background/95 backdrop-blur-sm transition-all duration-300",
          isHeaderCompact && "shadow-sm",
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
          {/* Bismillah — ornate floral unwan frame */}
          {preferences.showBismillah && surah.id !== 1 && surah.id !== 9 && (
            <div className="bismillah-ornament mb-6 text-center">
              <div className="relative inline-block px-12 py-6">
                <svg
                  className="absolute inset-0 w-full h-full text-primary"
                  viewBox="0 0 400 100"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                >
                  {/* Outer arch */}
                  <path
                    d="M35,95 L35,38 Q35,5 200,5 Q365,5 365,38 L365,95"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  {/* Inner arch */}
                  <path
                    d="M50,95 L50,42 Q50,14 200,14 Q350,14 350,42 L350,95"
                    strokeWidth="0.5"
                    opacity="0.18"
                  />

                  {/* Crown floral — palmette at top center */}
                  <ellipse cx="200" cy="5" rx="4" ry="7" fill="currentColor" opacity="0.18" />
                  <ellipse cx="193" cy="8" rx="3" ry="5" fill="currentColor" opacity="0.12" transform="rotate(-20 193 8)" />
                  <ellipse cx="207" cy="8" rx="3" ry="5" fill="currentColor" opacity="0.12" transform="rotate(20 207 8)" />
                  <circle cx="200" cy="5" r="2" fill="currentColor" stroke="none" opacity="0.28" />

                  {/* Left corner floral */}
                  <path d="M35,95 C28,90 25,83 30,78 C33,80 34,86 35,92" fill="currentColor" opacity="0.12" stroke="none" />
                  <path d="M35,95 C30,92 24,90 22,85" strokeWidth="0.5" opacity="0.22" />
                  <circle cx="22" cy="85" r="2" fill="currentColor" stroke="none" opacity="0.18" />
                  {/* Left corner vine tendril */}
                  <path d="M35,70 C28,65 25,68 28,73 C30,76 33,74 35,71" fill="currentColor" opacity="0.1" stroke="none" />
                  <path d="M28,73 C24,77 21,74 24,71" strokeWidth="0.4" opacity="0.18" />

                  {/* Right corner floral (mirror) */}
                  <path d="M365,95 C372,90 375,83 370,78 C367,80 366,86 365,92" fill="currentColor" opacity="0.12" stroke="none" />
                  <path d="M365,95 C370,92 376,90 378,85" strokeWidth="0.5" opacity="0.22" />
                  <circle cx="378" cy="85" r="2" fill="currentColor" stroke="none" opacity="0.18" />
                  {/* Right corner vine tendril */}
                  <path d="M365,70 C372,65 375,68 372,73 C370,76 367,74 365,71" fill="currentColor" opacity="0.1" stroke="none" />
                  <path d="M372,73 C376,77 379,74 376,71" strokeWidth="0.4" opacity="0.18" />

                  {/* Side vine accents along arch */}
                  <path d="M60,60 C54,55 50,58 53,63 C55,66 58,64 60,61" fill="currentColor" opacity="0.1" stroke="none" />
                  <path d="M340,60 C346,55 350,58 347,63 C345,66 342,64 340,61" fill="currentColor" opacity="0.1" stroke="none" />
                </svg>
                <p
                  lang="ar"
                  dir="rtl"
                  className="relative arabic-display text-2xl text-foreground/60 sm:text-3xl"
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            </div>
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
            isProse && (preferences.showArabic ? "prose-container" : "prose-container-ltr"),
          )}>
            {verses.map((verse) => {
              const focusClass = isFocus ? getFocusClass(verse.verseKey, verseKeys) : undefined;
              return (
                <div
                  key={verse.verseKey}
                  className={focusClass}
                >
                  <VerseBlock
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
                </div>
              );
            })}
          </div>

          {/* End spacer — extra room for floating mobile nav + audio dock */}
          <div className="h-32 md:h-24" />
        </div>
      </div>

      <ReadingToolbar />
    </div>
  );
}

/* ─── Translation color legend ─── */

import type { TranslationConfig } from "@/core/types";
import { CaretDownIcon } from "@phosphor-icons/react";
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
    <div className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-all tracking-wide uppercase"
      >
        <CaretDownIcon
          className={cn(
            "h-2.5 w-2.5 transition-transform",
            !open && "-rotate-90",
          )}
        />
        Translation key
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          {configs.map((c) => (
            <span key={c.translationId} className="flex items-center gap-2 text-[10px]">
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: `hsl(var(--translation-${c.colorSlot}))` }}
              />
              <span className="text-muted-foreground/60">
                {nameMap.get(c.translationId) ?? `Translation ${c.translationId}`}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
