"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import type { Verse, Translation, TranslationLayout } from "@/core/types";
import { cn } from "@/lib/utils";
import { VerseActions } from "./verse-actions";

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["sup", "sub", "b", "i", "em", "strong", "br", "span"],
    ALLOWED_ATTR: ["class"],
  });
}

interface VerseBlockProps {
  verse: Verse;
  translations: Translation[];
  showArabic: boolean;
  showTranslation: boolean;
  arabicSizeClass: string;
  translationSizeClass: string;
  translationLayout: TranslationLayout;
  isFocused: boolean;
  isBookmarked: boolean;
  isPlaying: boolean;
  onToggleBookmark: () => void;
  onPlay: () => void;
  onFocus: () => void;
}

export function VerseBlock({
  verse,
  translations,
  showArabic,
  showTranslation,
  arabicSizeClass,
  translationSizeClass,
  translationLayout,
  isFocused,
  isBookmarked,
  isPlaying,
  onToggleBookmark,
  onPlay,
  onFocus,
}: VerseBlockProps) {
  return (
    <div
      data-verse-key={verse.verseKey}
      className={cn(
        "group relative py-5 px-3 -mx-3 rounded-lg transition-all",
        isFocused && "bg-primary/5 verse-focused-indicator",
      )}
      onClick={onFocus}
    >
      {/* Verse number + actions */}
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
          {verse.verseNumber}
        </span>

        {/* Actions — visible on hover/focus */}
        <div className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <VerseActions
            verseKey={verse.verseKey}
            arabicText={verse.textUthmani}
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
            isPlaying && "text-primary",
          )}
        >
          {verse.textUthmani}
        </p>
      )}

      {/* Translations */}
      {showTranslation && translations.length > 0 && (
        <div
          className={cn(
            "mt-3",
            translationLayout === "columnar" && translations.length > 1
              ? "grid grid-cols-2 gap-4"
              : "space-y-2",
          )}
        >
          {translations.map((t) => (
            <TranslationText
              key={`${t.resourceId}-${t.verseKey}`}
              translation={t}
              sizeClass={translationSizeClass}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TranslationText({
  translation,
  sizeClass,
}: {
  translation: Translation;
  sizeClass: string;
}) {
  const html = useMemo(() => sanitizeHtml(translation.text), [translation.text]);
  const hasHtml = html !== translation.text || /<[^>]+>/.test(translation.text);

  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        {translation.resourceName}
      </p>
      {hasHtml ? (
        <p
          className={cn("text-muted-foreground leading-relaxed", sizeClass)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className={cn("text-muted-foreground leading-relaxed", sizeClass)}>
          {translation.text}
        </p>
      )}
    </div>
  );
}
