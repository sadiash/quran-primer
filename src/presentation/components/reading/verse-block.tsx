"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import type { Verse, Translation, TranslationLayout } from "@/core/types";
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

/**
 * Maps a translation's position (index among active translations) to
 * the corresponding CSS custom property defined per-theme in globals.css.
 */
function getTranslationColorVar(index: number): string {
  const slot = (index % 6) + 1;
  return `var(--translation-${slot})`;
}

interface VerseBlockProps {
  verse: Verse;
  translations: Translation[];
  showArabic: boolean;
  showTranslation: boolean;
  showVerseNumbers?: boolean;
  arabicSizeClass: string;
  translationSizeClass: string;
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
}

export function VerseBlock({
  verse,
  translations,
  showArabic,
  showTranslation,
  showVerseNumbers = true,
  arabicSizeClass,
  translationSizeClass,
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
          sizeClass={translationSizeClass}
        />
      )}
    </div>
  );
}

/* ─── Translation layout switcher ─── */

function TranslationGroup({
  translations,
  layout,
  sizeClass,
}: {
  translations: Translation[];
  layout: TranslationLayout;
  sizeClass: string;
}) {
  const multi = translations.length > 1;

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
            sizeClass={sizeClass}
            colorIndex={i}
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
          sizeClass={sizeClass}
          colorIndex={i}
          useColor={multi}
        />
      ))}
    </div>
  );
}

/* ─── Individual translation block ─── */

function TranslationText({
  translation,
  sizeClass,
  colorIndex,
  useColor,
}: {
  translation: Translation;
  sizeClass: string;
  colorIndex: number;
  useColor: boolean;
}) {
  const html = useMemo(() => sanitizeHtml(translation.text), [translation.text]);
  const hasHtml = html !== translation.text || /<[^>]+>/.test(translation.text);

  const colorStyle = useColor
    ? { color: `hsl(${getTranslationColorVar(colorIndex)})` }
    : undefined;

  return (
    <div className="space-y-0.5">
      <p
        className="text-[11px] font-medium tracking-wide"
        style={
          useColor
            ? { color: `hsl(${getTranslationColorVar(colorIndex)} / 0.6)` }
            : undefined
        }
      >
        <span className={useColor ? "" : "text-muted-foreground/70"}>
          {translation.resourceName}
        </span>
      </p>
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
