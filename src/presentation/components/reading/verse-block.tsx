"use client";

import { memo, useMemo, useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import type { Verse, Translation, TranslationLayout, TranslationConfig, TranslationFontSize, ReadingDensity, ReadingFlow } from "@/core/types";
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
  comfortable: "py-5 px-4",
  compact: "py-2.5 px-3",
  dense: "py-1 px-2",
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
  readingFlow?: ReadingFlow;
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
  readingFlow = "blocks",
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

  const isProse = readingFlow === "prose";

  return (
    <div
      data-verse-key={verse.verseKey}
      className={cn(
        "group relative verse-hover-glow",
        isProse
          ? "verse-prose py-0 px-0"
          : cn("rounded-xl", DENSITY_PADDING[density]),
        isFocused && (isProse ? "verse-focused-prose" : "bg-primary/[0.03] verse-focused-indicator"),
        isPlaying && !isProse && "bg-primary/[0.02]",
        isBookmarked && !isProse && "verse-bookmarked",
        hasNotes && !isProse && "verse-has-notes",
      )}
      onClick={onFocus}
      {...gestureHandlers}
    >
      {/* Action bar: full bar in blocks mode, compact popover in prose mode */}
      {isProse ? (
        <ProseActionTrigger
          isFocused={isFocused}
          isBookmarked={isBookmarked}
          hasNotes={hasNotes}
          isPlaying={isPlaying}
          onToggleBookmark={onToggleBookmark}
          onOpenNotes={onOpenNotes}
          onTogglePlay={onTogglePlay}
          onCopy={copyText}
          onStudy={onOpenStudy}
        />
      ) : (
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
      )}

      {/* Arabic text with ornamental verse number */}
      {showArabic && (
        <span
          lang="ar"
          dir="rtl"
          className={cn(
            "arabic-reading text-foreground",
            arabicSizeClass,
            DENSITY_ARABIC_LINE_HEIGHT[density],
            isProse ? "inline" : "block",
          )}
        >
          {verse.textUthmani}
          {showVerseNumbers && (
            <span className="verse-number-ornament">
              {toArabicNumerals(verse.verseNumber)}
            </span>
          )}
        </span>
      )}

      {/* Verse number for translation-only mode (blocks only — prose handles it inline) */}
      {!showArabic && showVerseNumbers && showTranslation && !isProse && (
        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full border border-muted-foreground/15 text-[9px] text-muted-foreground/40 font-medium select-none">
          {verse.verseNumber}
        </span>
      )}

      {/* Translations — inline in prose mode */}
      {showTranslation && translations.length > 0 && isProse && (
        <ProseTranslations
          translations={translations}
          showArabic={showArabic}
          verseNumber={verse.verseNumber}
          showVerseNumbers={showVerseNumbers ?? true}
          globalFontSize={translationConfigs[0]?.fontSize ?? "md"}
        />
      )}

      {/* Translations — block layout in blocks mode */}
      {showTranslation && translations.length > 0 && !isProse && (
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
    prev.readingFlow === next.readingFlow &&
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

  const gapClass = density === "dense" ? "mt-1.5" : density === "compact" ? "mt-2" : "mt-3";

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
  const fontFamily = config?.fontFamily ?? "sans";
  const isBold = config?.bold ?? false;
  const sizeClass = isPrimary
    ? TRANSLATION_SIZE_CLASS["xl"]
    : TRANSLATION_SIZE_CLASS[fontSize];
  const colorVar = `var(--translation-${colorSlot})`;

  const colorStyle = useColor
    ? { color: `hsl(${colorVar})` }
    : undefined;

  const textClass = cn(
    "leading-[1.8] tracking-[0.01em]",
    sizeClass,
    !useColor && "text-muted-foreground/80",
    fontFamily === "serif" && "font-serif",
    isBold && "font-semibold",
  );

  return (
    <div>
      {hasHtml ? (
        <p
          className={textClass}
          style={colorStyle}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p
          className={textClass}
          style={colorStyle}
        >
          {translation.text}
        </p>
      )}
    </div>
  );
}

/* ─── Prose-mode compact action trigger ─── */

function ProseActionTrigger({
  isFocused,
  isBookmarked,
  hasNotes,
  isPlaying,
  onToggleBookmark,
  onOpenNotes,
  onTogglePlay,
  onCopy,
  onStudy,
}: {
  isFocused: boolean;
  isBookmarked: boolean;
  hasNotes: boolean;
  isPlaying: boolean;
  onToggleBookmark: () => void;
  onOpenNotes: () => void;
  onTogglePlay: () => void;
  onCopy: () => void;
  onStudy: () => void;
}) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Only show trigger when this verse is focused
  if (!isFocused) return null;

  return (
    <span className="relative inline-block align-middle" ref={popoverRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="inline-flex items-center justify-center rounded-full w-5 h-5 text-primary/60 hover:text-primary hover:bg-primary/10 transition-fast mx-0.5"
        aria-label="Verse actions"
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="12" cy="19" r="2.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 flex items-center gap-0.5 rounded-lg px-1.5 py-1 bg-card border border-border shadow-soft-lg animate-scale-in">
          <ProseAction
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); setOpen(false); }}
            active={isBookmarked}
            label={isBookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </ProseAction>
          <ProseAction
            onClick={(e) => { e.stopPropagation(); onOpenNotes(); setOpen(false); }}
            active={hasNotes}
            activeClass="text-amber-500/80"
            label="Notes"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={hasNotes ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
              <path d="M15 3v4a2 2 0 0 0 2 2h4" />
            </svg>
          </ProseAction>
          <ProseAction
            onClick={(e) => { e.stopPropagation(); onStudy(); setOpen(false); }}
            label="Tafsir"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </ProseAction>
          <ProseAction
            onClick={(e) => { e.stopPropagation(); onCopy(); setOpen(false); }}
            label="Copy"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </ProseAction>
          <ProseAction
            onClick={(e) => { e.stopPropagation(); onTogglePlay(); setOpen(false); }}
            active={isPlaying}
            label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2}>
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            )}
          </ProseAction>
        </div>
      )}
    </span>
  );
}

function ProseAction({
  children,
  onClick,
  active = false,
  activeClass = "text-primary",
  label,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  activeClass?: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md p-1 transition-fast",
        active
          ? activeClass
          : "text-muted-foreground/60 hover:text-foreground",
      )}
      aria-label={label}
    >
      {children}
    </button>
  );
}

/* ─── Prose-mode inline translations ─── */

function ProseTranslations({
  translations,
  showArabic,
  verseNumber,
  showVerseNumbers,
  globalFontSize,
}: {
  translations: Translation[];
  showArabic: boolean;
  verseNumber: number;
  showVerseNumbers: boolean;
  globalFontSize: TranslationFontSize;
}) {
  // In prose mode: uniform muted color, respect font size setting
  const sizeClass = TRANSLATION_SIZE_CLASS[globalFontSize];

  return (
    <span className={showArabic ? "block mt-0.5" : "inline"}>
      {translations.map((t, i) => {
        const plainText = t.text.replace(/<[^>]+>/g, "");

        return (
          <span key={`${t.resourceId}-${t.verseKey}`}>
            {i > 0 && <span className="text-muted-foreground/20"> / </span>}
            <span
              className={cn(
                "leading-relaxed text-muted-foreground",
                sizeClass,
              )}
              dir="ltr"
              lang="en"
            >
              {plainText}
            </span>
          </span>
        );
      })}
      {!showArabic && showVerseNumbers && (
        <span className="text-[0.6em] align-super text-muted-foreground/40 font-mono select-none mx-0.5">
          {verseNumber}
        </span>
      )}
      {" "}
    </span>
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
