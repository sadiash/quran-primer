"use client";

import { memo, useMemo } from "react";
import DOMPurify from "dompurify";
import type { Verse, Translation, TranslationLayout, TranslationConfig, TranslationFontSize, ReadingDensity } from "@/core/types";
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

/** Convert western digits to Arabic-Indic numerals */
function toArabicNumerals(n: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).replace(/\d/g, (d) => arabicDigits[Number(d)]!);
}

const DENSITY_PADDING: Record<ReadingDensity, string> = {
  comfortable: "py-3 px-3",
  compact: "py-1.5 px-2",
  dense: "py-0.5 px-1.5",
};

const DENSITY_ARABIC_LINE_HEIGHT: Record<ReadingDensity, string> = {
  comfortable: "arabic-reading-comfortable",
  compact: "arabic-reading-compact",
  dense: "arabic-reading-dense",
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
  density: ReadingDensity;
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
  density,
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
        "group relative -mx-2 rounded-lg transition-all",
        DENSITY_PADDING[density],
        isFocused && "bg-primary/5 verse-focused-indicator",
        isPlaying && "bg-primary/[0.03]",
        isBookmarked && "verse-bookmarked",
        hasNotes && "verse-has-notes",
      )}
      onClick={onFocus}
      {...gestureHandlers}
    >
      {/* Floating action bar — visible on hover or focus */}
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

      {/* Arabic text with inline verse number */}
      {showArabic && (
        <p
          lang="ar"
          dir="rtl"
          className={cn(
            "arabic-reading text-foreground",
            arabicSizeClass,
            DENSITY_ARABIC_LINE_HEIGHT[density],
          )}
        >
          {verse.textUthmani}
          {showVerseNumbers && (
            <span className="mr-1 text-[0.5em] align-super text-muted-foreground/50 font-sans select-none">
              {toArabicNumerals(verse.verseNumber)}
            </span>
          )}
        </p>
      )}

      {/* Verse number for translation-only mode */}
      {!showArabic && showVerseNumbers && showTranslation && (
        <span className="text-[10px] text-muted-foreground/40 font-mono select-none">
          {verse.verseNumber}
        </span>
      )}

      {/* Translations */}
      {showTranslation && translations.length > 0 && (
        <TranslationGroup
          translations={translations}
          layout={translationLayout}
          configs={translationConfigs}
          showArabic={showArabic}
          density={density}
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
    prev.density === next.density &&
    prev.translations === next.translations &&
    prev.translationConfigs === next.translationConfigs &&
    prev.concepts === next.concepts &&
    prev.conceptMaxVisible === next.conceptMaxVisible &&
    prev.conceptColorSlot === next.conceptColorSlot
  );
});
VerseBlock.displayName = "VerseBlock";

/* ─── Translation layout switcher ─── */

function TranslationGroup({
  translations,
  layout,
  configs,
  showArabic,
  density,
}: {
  translations: Translation[];
  layout: TranslationLayout;
  configs: TranslationConfig[];
  showArabic: boolean;
  density: ReadingDensity;
}) {
  const multi = translations.length > 1;
  const configMap = useMemo(() => {
    const m = new Map<number, TranslationConfig>();
    for (const c of configs) m.set(c.translationId, c);
    return m;
  }, [configs]);

  const gapClass = density === "dense" ? "mt-1" : density === "compact" ? "mt-1.5" : "mt-2";

  if (layout === "columnar" && multi) {
    return (
      <div
        className={cn(
          "grid gap-2",
          gapClass,
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

  // Stacked (default)
  return (
    <div className={cn("space-y-1", gapClass)}>
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

/* ─── Individual translation block ─── */

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
  const colorVar = `var(--translation-${colorSlot})`;

  const colorStyle = useColor
    ? { color: `hsl(${colorVar})` }
    : undefined;

  return (
    <div>
      {hasHtml ? (
        <p
          className={cn("leading-relaxed", sizeClass, !useColor && "text-muted-foreground")}
          style={colorStyle}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p
          className={cn("leading-relaxed", sizeClass, !useColor && "text-muted-foreground")}
          style={colorStyle}
        >
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

  const pillClass =
    colorSlot === 0
      ? "bg-muted text-muted-foreground"
      : "text-white";
  const pillStyle =
    colorSlot >= 1 && colorSlot <= 6
      ? { backgroundColor: `hsl(var(--translation-${colorSlot}) / 0.75)` }
      : undefined;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {visible.map((c) => (
        <Tooltip key={c.id}>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium cursor-default",
                pillClass,
              )}
              style={pillStyle}
            >
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
        <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground/70">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
