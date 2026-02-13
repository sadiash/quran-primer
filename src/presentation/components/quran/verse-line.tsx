"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Verse, Translation, TranslationLayout } from "@/core/types";
import { toEasternArabicNumeral } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { useWorkspace } from "@/presentation/providers/workspace-provider";
import { VerseActions } from "./verse-actions";

interface VerseLineProps {
  verse: Verse;
  surahId: number;
  translations?: Translation[];
  observerRef: RefObject<IntersectionObserver | null>;
  isBookmarked?: boolean;
  hasNote?: boolean;
  onNoteClick?: () => void;
  showArabic?: boolean;
  translationLayout?: TranslationLayout;
}

export function VerseLine({
  verse,
  surahId,
  translations = [],
  observerRef,
  isBookmarked,
  hasNote,
  onNoteClick,
  showArabic = true,
  translationLayout = "stacked",
}: VerseLineProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const { currentVerseKey } = useAudioPlayer();
  const ws = useWorkspace();
  const isCurrentlyPlaying = currentVerseKey === verse.verseKey;
  const isFocused = ws.state.focusedVerseKey === verse.verseKey;
  const [activeTab, setActiveTab] = useState(0);

  const handleVerseClick = useCallback(() => {
    ws.focusVerse(verse.verseKey);
    if (!ws.state.studyRegionOpen) {
      ws.addPanel("context-preview");
    }
  }, [verse.verseKey, ws]);

  useEffect(() => {
    const el = elRef.current;
    const observer = observerRef.current;
    if (!el || !observer) return;

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [observerRef]);

  const arabicBlock = showArabic ? (
    <div
      className="flex-1 text-right text-2xl leading-[2.4]"
      dir="rtl"
      lang="ar"
      style={{ fontFamily: "var(--font-arabic-reading)" }}
    >
      <span className="inline rounded-sm transition-fast group-hover:bg-primary/5">
        {verse.textUthmani}
      </span>
      <span className="mx-2 text-lg text-primary/70">
        ﴿{toEasternArabicNumeral(verse.verseNumber)}﴾
      </span>
    </div>
  ) : null;

  const verseNumberBadge = !showArabic ? (
    <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
      {verse.verseNumber}
    </span>
  ) : null;

  return (
    <div
      ref={elRef}
      data-verse-key={verse.verseKey}
      id={`verse-${verse.verseKey}`}
      role="button"
      tabIndex={0}
      onClick={handleVerseClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleVerseClick();
        }
      }}
      className={cn(
        "group cursor-pointer rounded-lg py-4 transition-smooth",
        isCurrentlyPlaying && "bg-primary/5 shadow-glow",
        isFocused && "bg-primary/[0.07] ring-1 ring-primary/20 verse-focused-indicator",
        !isFocused && isBookmarked && "border-l-2 border-primary/50 pl-3",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {showArabic ? (
          arabicBlock
        ) : (
          <div className="flex-1">{verseNumberBadge}</div>
        )}

        <VerseActions
          verseKey={verse.verseKey}
          surahId={surahId}
          isBookmarked={isBookmarked}
          hasNote={hasNote}
          onNoteClick={onNoteClick}
        />
      </div>

      {translations.length > 0 && (
        <TranslationBlock
          translations={translations}
          layout={translationLayout}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
}

// --- Translation rendering by layout ---

interface TranslationBlockProps {
  translations: Translation[];
  layout: TranslationLayout;
  activeTab: number;
  onTabChange: (index: number) => void;
}

function TranslationBlock({
  translations,
  layout,
  activeTab,
  onTabChange,
}: TranslationBlockProps) {
  if (translations.length === 0) return null;

  if (layout === "tabbed" && translations.length > 1) {
    return (
      <TabbedTranslations
        translations={translations}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    );
  }

  if (layout === "columnar" && translations.length > 1) {
    return <ColumnarTranslations translations={translations} />;
  }

  // Default: stacked
  return <StackedTranslations translations={translations} />;
}

function StackedTranslations({
  translations,
}: {
  translations: Translation[];
}) {
  return (
    <div className="mt-2 space-y-2">
      {translations.map((t) => (
        <div key={`${t.resourceId}-${t.verseKey}`}>
          {translations.length > 1 && (
            <span className="mb-0.5 block text-xs font-medium text-muted-foreground/70">
              {t.resourceName}
            </span>
          )}
          <p
            className="text-sm leading-relaxed text-muted-foreground"
            dir="ltr"
          >
            {t.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function ColumnarTranslations({
  translations,
}: {
  translations: Translation[];
}) {
  const gridCols =
    translations.length === 2
      ? "lg:grid-cols-2"
      : translations.length === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-2";

  return (
    <div className={cn("mt-2 grid grid-cols-1 gap-3", gridCols)}>
      {translations.map((t) => (
        <div
          key={`${t.resourceId}-${t.verseKey}`}
          className="rounded-md border border-border/50 p-2"
        >
          <span className="mb-0.5 block text-xs font-medium text-muted-foreground/70">
            {t.resourceName}
          </span>
          <p
            className="text-sm leading-relaxed text-muted-foreground"
            dir="ltr"
          >
            {t.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function TabbedTranslations({
  translations,
  activeTab,
  onTabChange,
}: {
  translations: Translation[];
  activeTab: number;
  onTabChange: (index: number) => void;
}) {
  const safeIndex = Math.min(activeTab, translations.length - 1);
  const active = translations[safeIndex];

  return (
    <div className="mt-2">
      <div
        className="mb-1.5 flex gap-1 overflow-x-auto"
        role="tablist"
        aria-label="Translation tabs"
      >
        {translations.map((t, i) => (
          <button
            key={t.resourceId}
            role="tab"
            aria-selected={i === safeIndex}
            className={cn(
              "whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-smooth",
              i === safeIndex
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-surface-hover",
            )}
            onClick={() => onTabChange(i)}
          >
            {t.resourceName}
          </button>
        ))}
      </div>
      {active && (
        <p
          className="text-sm leading-relaxed text-muted-foreground"
          dir="ltr"
          role="tabpanel"
        >
          {active.text}
        </p>
      )}
    </div>
  );
}
