"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";
import { Bookmark, BookmarkCheck, Play, Pause } from "lucide-react";
import type { Verse, Translation, TranslationLayout } from "@/core/types";
import { cn } from "@/lib/utils";

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
      {/* Verse number */}
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
          {verse.verseNumber}
        </span>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-fast"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={cn(
              "rounded-md p-1.5 transition-fast",
              isBookmarked
                ? "text-primary"
                : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
            )}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
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
