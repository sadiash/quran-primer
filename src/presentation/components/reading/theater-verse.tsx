"use client";

import { memo, useMemo } from "react";
import DOMPurify from "dompurify";
import type { Verse, Translation } from "@/core/types";

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["sup", "sub", "b", "i", "em", "strong", "br", "span"],
    ALLOWED_ATTR: ["class"],
  });
}

/** Convert western digits to Arabic-Indic numerals */
function toArabicNumerals(n: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n).replace(/\d/g, (d) => arabicDigits[Number(d)]!);
}

interface TheaterVerseProps {
  verse: Verse;
  translations: Translation[];
  showArabic: boolean;
  showTranslation: boolean;
  isActive: boolean;
}

function TheaterVerseInner({
  verse,
  translations,
  showArabic,
  showTranslation,
  isActive,
}: TheaterVerseProps) {
  const plainTranslations = useMemo(
    () =>
      translations.map((t) => {
        const clean = sanitizeHtml(t.text).replace(/<[^>]+>/g, "");
        return { resourceId: t.resourceId, text: clean };
      }),
    [translations],
  );

  return (
    <div
      data-verse-key={verse.verseKey}
      className="theater-slide"
    >
      {/* Arabic text — massive */}
      {showArabic && (
        <div
          lang="ar"
          dir="rtl"
          className={`theater-arabic ${isActive ? "theater-arabic-enter" : ""}`}
        >
          {verse.textUthmani}
          <span className="verse-number-ornament" style={{ fontSize: "0.35em" }}>
            {toArabicNumerals(verse.verseNumber)}
          </span>
        </div>
      )}

      {/* Translation — fades in after Arabic, serif display */}
      {showTranslation && plainTranslations.length > 0 && (
        <div className={`theater-translation serif-display ${isActive ? "theater-translation-enter" : ""}`}>
          {plainTranslations.map((t, i) => (
            <p key={t.resourceId}>
              {i > 0 && <span className="text-muted-foreground/20"> · </span>}
              {t.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export const TheaterVerse = memo(TheaterVerseInner, (prev, next) => {
  return (
    prev.verse.verseKey === next.verse.verseKey &&
    prev.isActive === next.isActive &&
    prev.showArabic === next.showArabic &&
    prev.showTranslation === next.showTranslation &&
    prev.translations === next.translations
  );
});
TheaterVerse.displayName = "TheaterVerse";
