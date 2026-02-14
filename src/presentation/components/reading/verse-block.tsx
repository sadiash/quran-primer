"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import type { Verse, Translation, TranslationLayout, TranslationConfig, TranslationFontSize } from "@/core/types";
import type { ConceptTag } from "@/presentation/components/quran/reading-page";
import { cn } from "@/lib/utils";
import { useGestures } from "@/presentation/hooks/use-gestures";
import { VerseActions } from "./verse-actions";

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
  showActions?: boolean;
  onToggleBookmark: () => void;
  onPlay: () => void;
  onFocus: () => void;
  onLongPress?: () => void;
  onSwipeRight?: () => void;
  concepts?: ConceptTag[];
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
  showActions,
  onToggleBookmark,
  onPlay,
  onFocus,
  onLongPress,
  onSwipeRight,
  concepts = [],
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
      {/* Bookmark indicator — thin left edge line */}
      {isBookmarked && (
        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary/40" />
      )}

      {/* Verse number + actions */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {showVerseNumbers && (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
              {verse.verseNumber}
            </span>
          )}
          {/* Notes indicator — amber dot */}
          {hasNotes && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
          )}
        </div>

        {/* Actions — visible on hover/focus or when forced via long-press */}
        <div className={cn(
          "transition-opacity",
          showActions ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
        )}>
          <VerseActions
            verseKey={verse.verseKey}
            arabicText={verse.textUthmani}
            translations={translations}
            isBookmarked={isBookmarked}
            isPlaying={isPlaying}
            onToggleBookmark={onToggleBookmark}
            onPlay={onPlay}
          />
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
        <ConceptPills concepts={concepts} />
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

/* ─── Concept tag pills ─── */

const MAX_VISIBLE_CONCEPTS = 5;

function ConceptPills({ concepts }: { concepts: ConceptTag[] }) {
  const visible = concepts.slice(0, MAX_VISIBLE_CONCEPTS);
  const remaining = concepts.length - MAX_VISIBLE_CONCEPTS;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {visible.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
        >
          {c.name}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground/70">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
