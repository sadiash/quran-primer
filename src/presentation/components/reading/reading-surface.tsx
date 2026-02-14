"use client";

import { useEffect, useRef, useCallback, useState, useMemo, Fragment } from "react";
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
  const { preferences } = usePreferences();
  const { focusVerse, focusedVerseKey, openPanel } = usePanels();
  const { updateProgress } = useProgress(surah.id);
  const { isBookmarked, toggleBookmark } = useBookmarks(surah.id);
  const { notes } = useNotes({ forSurahReading: surah.id });
  const audio = useAudioPlayer();
  const { observerRef, getCurrentVerseKey } = useVerseVisibility();
  const containerRef = useRef<HTMLDivElement>(null);
  const [longPressedKey, setLongPressedKey] = useState<string | null>(null);

  // After a manual focus (click, keyboard, menu), suppress scroll-based
  // polling for 5 seconds so the user's selection stays put.
  const manualFocusUntil = useRef(0);
  const focusVerseManually = useCallback(
    (key: string) => {
      manualFocusUntil.current = Date.now() + 5000;
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

  // Auto-clear long-press after 3s
  useEffect(() => {
    if (!longPressedKey) return;
    const timer = setTimeout(() => setLongPressedKey(null), 3000);
    return () => clearTimeout(timer);
  }, [longPressedKey]);

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

  // Poll observer for current visible verse — skip during manual focus cooldown
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() < manualFocusUntil.current) return;
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

  // translationSizeClass removed — now per-translation via resolvedConfigs

  // Keyboard shortcuts: j/k/b/t/n + arrows
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
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedVerseKey, verses, focusVerseManually, toggleBookmark, surah.id, openPanel]);

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth"
      >
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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

          <div className="mt-8 space-y-0 divide-y divide-border/30">
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
                isFocused={focusedVerseKey === verse.verseKey}
                isBookmarked={isBookmarked(verse.verseKey)}
                isPlaying={audio.currentVerseKey === verse.verseKey && audio.isPlaying}
                hasNotes={noteVerseKeys.has(verse.verseKey)}
                showActions={longPressedKey === verse.verseKey}
                onToggleBookmark={() => toggleBookmark(verse.verseKey, surah.id)}
                onPlay={() => audio.play(verse.verseKey, surah.id)}
                onFocus={() => focusVerseManually(verse.verseKey)}
                onLongPress={() => setLongPressedKey(verse.verseKey)}
                onSwipeRight={() => toggleBookmark(verse.verseKey, surah.id)}
                concepts={preferences.showConcepts ? (conceptsByVerse?.[verse.verseKey] ?? []) : []}
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
    <div className="mt-6">
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
