"use client";

import { memo, useMemo } from "react";
import DOMPurify from "dompurify";
import type { Verse, Translation, TranslationLayout, TranslationConfig, TranslationFontSize } from "@/core/types";
import type { ConceptTag } from "@/presentation/components/quran/reading-page";
import { cn } from "@/lib/utils";
import { useGestures } from "@/presentation/hooks/use-gestures";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/presentation/components/ui/tooltip";
import { VerseActionBar } from "./verse-action-bar";

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["sup", "sub", "b", "i", "em", "strong", "br", "span"],
    ALLOWED_ATTR: ["class"],
  });
}

const TRANSLATION_SIZE_CLASS: Record<TranslationFontSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

interface VerseBlockProps {
  verse: Verse;
  translations: Translation[];
  showArabic: boolean;
  showTranslation: boolean;
  showVerseNumbers?: boolean;
  arabicSizeClass: string;
  translationConfigs: TranslationConfig[];
  translationLayout: TranslationLayout;
  isFocused: boolean;
  isBookmarked: boolean;
  isPlaying: boolean;
  hasNotes: boolean;
  onToggleBookmark: () => void;
  onTogglePlay: () => void;
  onFocus: () => void;
  onOpenNotes: () => void;
  onOpenStudy: () => void;
  onLongPress?: () => void;
  onSwipeRight?: () => void;
  concepts?: ConceptTag[];
  conceptMaxVisible?: number;
  conceptColorSlot?: number;
  focusBgColor?: string;
}

function VerseBlockInner({
  verse,
  translations,
  showArabic,
  showTranslation,
  showVerseNumbers = true,
  arabicSizeClass,
  translationConfigs,
  translationLayout,
  isFocused,
  isBookmarked,
  isPlaying,
  hasNotes,
  onToggleBookmark,
  onTogglePlay,
  onFocus,
  onOpenNotes,
  onOpenStudy,
  onLongPress,
  onSwipeRight,
  concepts = [],
  conceptMaxVisible = 5,
  conceptColorSlot = 0,
  focusBgColor,
}: VerseBlockProps) {
  const gestureHandlers = useGestures({ onLongPress, onSwipeRight });

  const copyText = () => {
    const text = showArabic
      ? verse.textUthmani
      : translations[0]?.text.replace(/<[^>]+>/g, "") ?? verse.textUthmani;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div
      data-verse-key={verse.verseKey}
      className={cn(
        "group relative py-3 px-4 border-l-2 transition-colors",
        isFocused
          ? "border-l-transparent verse-focused-indicator"
          : "border-l-transparent hover:bg-surface/50",
        isBookmarked && "verse-bookmarked",
        hasNotes && "verse-has-notes",
      )}
      style={isFocused && focusBgColor ? { backgroundColor: focusBgColor } : undefined}
      onClick={onFocus}
      {...gestureHandlers}
    >
      {/* Action bar */}
      <VerseActionBar
        isBookmarked={isBookmarked}
        hasNotes={hasNotes}
        isPlaying={isPlaying}
        isFocused={isFocused}
        onToggleBookmark={onToggleBookmark}
        onOpenNotes={onOpenNotes}
        onTogglePlay={onTogglePlay}
        onCopy={copyText}
        onStudy={onOpenStudy}
      />

      {/* Arabic text with monospace verse number */}
      {showArabic && (
        <div lang="ar" dir="rtl" className={cn("arabic-reading text-foreground block", arabicSizeClass)}>
          {verse.textUthmani}
          {showVerseNumbers && (
            <span className="verse-number-ornament">
              [ {verse.verseNumber} ]
            </span>
          )}
        </div>
      )}

      {/* Verse number for translation-only mode */}
      {!showArabic && showVerseNumbers && showTranslation && (
        <span className="font-mono text-[10px] font-bold text-muted-foreground select-none">
          [ {verse.verseNumber} ]
        </span>
      )}

      {/* Translations */}
      {showTranslation && translations.length > 0 && (
        <TranslationGroup
          translations={translations}
          layout={translationLayout}
          configs={translationConfigs}
          showArabic={showArabic}
        />
      )}

      {/* Concept tags */}
      {concepts.length > 0 && (
        <ConceptPills concepts={concepts} maxVisible={conceptMaxVisible} colorSlot={conceptColorSlot} />
      )}
    </div>
  );
}

export const VerseBlock = memo(VerseBlockInner, (prev, next) => {
  return (
    prev.verse.verseKey === next.verse.verseKey &&
    prev.isFocused === next.isFocused &&
    prev.isBookmarked === next.isBookmarked &&
    prev.isPlaying === next.isPlaying &&
    prev.hasNotes === next.hasNotes &&
    prev.showArabic === next.showArabic &&
    prev.showTranslation === next.showTranslation &&
    prev.showVerseNumbers === next.showVerseNumbers &&
    prev.arabicSizeClass === next.arabicSizeClass &&
    prev.translationLayout === next.translationLayout &&
    prev.translations === next.translations &&
    prev.translationConfigs === next.translationConfigs &&
    prev.concepts === next.concepts &&
    prev.conceptMaxVisible === next.conceptMaxVisible &&
    prev.conceptColorSlot === next.conceptColorSlot &&
    prev.focusBgColor === next.focusBgColor
  );
});
VerseBlock.displayName = "VerseBlock";

/* ─── Translation layout ─── */

function TranslationGroup({
  translations,
  layout,
  configs,
  showArabic,
}: {
  translations: Translation[];
  layout: TranslationLayout;
  configs: TranslationConfig[];
  showArabic: boolean;
}) {
  const multi = translations.length > 1;
  const configMap = useMemo(() => {
    const m = new Map<number, TranslationConfig>();
    for (const c of configs) m.set(c.translationId, c);
    return m;
  }, [configs]);

  if (layout === "columnar" && multi) {
    return (
      <div
        className={cn(
          "grid gap-2 mt-3",
          translations.length === 2 && "grid-cols-2",
          translations.length >= 3 && "grid-cols-2 lg:grid-cols-3",
        )}
      >
        {translations.map((t, i) => (
          <TranslationText
            key={`${t.resourceId}-${t.verseKey}`}
            translation={t}
            config={configMap.get(t.resourceId)}
            isPrimary={!showArabic && i === 0}
            useColor={multi}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-3">
      {translations.map((t, i) => (
        <TranslationText
          key={`${t.resourceId}-${t.verseKey}`}
          translation={t}
          config={configMap.get(t.resourceId)}
          isPrimary={!showArabic && i === 0}
          useColor={multi}
        />
      ))}
    </div>
  );
}

/* ─── Individual translation — colored editorial strip ─── */

function TranslationText({
  translation,
  config,
  isPrimary,
  useColor,
}: {
  translation: Translation;
  config?: TranslationConfig;
  isPrimary: boolean;
  useColor: boolean;
}) {
  const html = useMemo(() => sanitizeHtml(translation.text), [translation.text]);
  const hasHtml = html !== translation.text || /<[^>]+>/.test(translation.text);

  const fontSize = config?.fontSize ?? "md";
  const colorSlot = config?.colorSlot ?? 1;
  const sizeClass = isPrimary
    ? TRANSLATION_SIZE_CLASS["xl"]
    : TRANSLATION_SIZE_CLASS[fontSize];

  const textClass = cn(
    "leading-[1.8] tracking-[0.01em]",
    sizeClass,
  );

  // When multiple translations, render as colored strip with translator name
  if (useColor) {
    return (
      <div
        className="px-3 py-2"
        style={{
          backgroundColor: `var(--translation-${colorSlot}-bg)`,
          borderLeft: `3px solid var(--translation-${colorSlot}-border)`,
        }}
      >
        <span
          className="font-mono text-[9px] font-bold uppercase tracking-wider block mb-1"
          style={{ color: `var(--translation-${colorSlot}-label)` }}
        >
          {translation.resourceName}
        </span>
        {hasHtml ? (
          <p
            className={cn(textClass, "text-foreground")}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className={cn(textClass, "text-foreground")}>
            {translation.text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {hasHtml ? (
        <p
          className={cn(textClass, "text-muted-foreground")}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className={cn(textClass, "text-muted-foreground")}>
          {translation.text}
        </p>
      )}
    </div>
  );
}

/* ─── Concept tag pills ─── */

function ConceptPills({
  concepts,
  maxVisible,
  colorSlot,
}: {
  concepts: ConceptTag[];
  maxVisible: number;
  colorSlot: number;
}) {
  const visible = maxVisible === 0 ? concepts : concepts.slice(0, maxVisible);
  const remaining = maxVisible === 0 ? 0 : concepts.length - maxVisible;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {visible.map((c) => (
        <Tooltip key={c.id}>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center border border-border bg-[#f0fdf9] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider cursor-default text-[#0d7d6c]">
              {c.name}
            </span>
          </TooltipTrigger>
          {c.definition && (
            <TooltipContent className="max-w-xs text-xs">
              {c.definition}
            </TooltipContent>
          )}
        </Tooltip>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
          +{remaining}
        </span>
      )}
    </div>
  );
}
