"use client";

import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import type { Verse, Translation, TranslationLayout, TranslationConfig, TranslationFontSize } from "@/core/types";
import type { ConceptTag } from "@/presentation/components/quran/reading-page";
import { cn } from "@/lib/utils";
import { useGestures } from "@/presentation/hooks/use-gestures";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/presentation/components/ui/tooltip";

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
  onLongPress?: () => void;
  onSwipeRight?: () => void;
  concepts?: ConceptTag[];
  conceptMaxVisible?: number;
  conceptColorSlot?: number;
}

export function VerseBlock({
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
  onLongPress,
  onSwipeRight,
  concepts = [],
  conceptMaxVisible = 5,
  conceptColorSlot = 0,
}: VerseBlockProps) {
  const gestureHandlers = useGestures({ onLongPress, onSwipeRight });

  return (
    <div
      data-verse-key={verse.verseKey}
      className={cn(
        "group relative py-5 px-3 -mx-3 rounded-lg transition-all",
        isFocused && "bg-primary/5 verse-focused-indicator",
        isPlaying && "bg-primary/[0.03]",
      )}
      onClick={onFocus}
      {...gestureHandlers}
    >
      {/* Verse number + inline actions */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {showVerseNumbers && (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
              {verse.verseNumber}
            </span>
          )}
          {/* Bookmark toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
            className={cn(
              "transition-colors",
              isBookmarked
                ? "text-primary hover:text-primary/70"
                : "text-muted-foreground/30 hover:text-muted-foreground/60",
            )}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>
          {/* Notes — filled when has notes, outline when empty */}
          <button
            onClick={(e) => { e.stopPropagation(); onOpenNotes(); }}
            className={cn(
              "transition-colors",
              hasNotes
                ? "text-amber-500/70 hover:text-amber-500"
                : "text-muted-foreground/30 hover:text-muted-foreground/60",
            )}
            aria-label={hasNotes ? "View notes" : "Add note"}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={hasNotes ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
              <path d="M15 3v4a2 2 0 0 0 2 2h4" />
            </svg>
          </button>
          {/* Copy top visible text */}
          <CopyButton
            getText={() => {
              if (showArabic) return verse.textUthmani;
              const first = translations[0];
              if (first) return first.text.replace(/<[^>]+>/g, "");
              return verse.textUthmani;
            }}
          />
          {/* Play / Pause audio */}
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
            className={cn(
              "transition-colors",
              isPlaying
                ? "text-primary hover:text-primary/70"
                : "text-muted-foreground/30 hover:text-muted-foreground/60",
            )}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Arabic text */}
      {showArabic && (
        <p
          lang="ar"
          dir="rtl"
          className={cn(
            "arabic-reading leading-loose text-foreground",
            arabicSizeClass,
          )}
        >
          {verse.textUthmani}
        </p>
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

/* ─── Translation layout switcher ─── */

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
          "mt-3 grid gap-3",
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
    <div className="mt-3 space-y-1.5">
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
    <div className="space-y-0.5">
      {/* Show inline label only for single translation (no color key) */}
      {!useColor && (
        <p className="text-[11px] font-medium tracking-wide">
          <span className="text-muted-foreground/70">
            {translation.resourceName}
          </span>
        </p>
      )}
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

/* ─── Copy button with feedback ─── */

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(getText()).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className={cn(
        "transition-colors",
        copied
          ? "text-green-500"
          : "text-muted-foreground/30 hover:text-muted-foreground/60",
      )}
      aria-label="Copy text"
    >
      {copied ? (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
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
    <div className="mt-2 flex flex-wrap gap-1">
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
