"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import DOMPurify from "dompurify";
import type { Verse, Translation } from "@/core/types";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { ReadingToolbar } from "./reading-toolbar";

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

interface MushafSurfaceProps {
  surah: { id: number; versesCount: number; nameArabic: string };
  verses: Verse[];
  translations: Translation[];
}

interface MushafPage {
  verses: Verse[];
  pageNumber: number;
}

/**
 * Group verses into pages using a character-count heuristic.
 * Approximate: ~800 chars of Arabic text per page (tuned for visual balance).
 */
function paginateVerses(verses: Verse[]): MushafPage[] {
  const TARGET_CHARS_PER_PAGE = 800;
  const pages: MushafPage[] = [];
  let current: Verse[] = [];
  let charCount = 0;

  for (const verse of verses) {
    const len = verse.textUthmani.length;
    if (current.length > 0 && charCount + len > TARGET_CHARS_PER_PAGE) {
      pages.push({ verses: current, pageNumber: pages.length + 1 });
      current = [];
      charCount = 0;
    }
    current.push(verse);
    charCount += len;
  }

  if (current.length > 0) {
    pages.push({ verses: current, pageNumber: pages.length + 1 });
  }

  return pages;
}

export function MushafSurface({ surah, verses, translations }: MushafSurfaceProps) {
  const { preferences } = usePreferences();
  const [currentSpread, setCurrentSpread] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);

  const pages = useMemo(() => paginateVerses(verses), [verses]);

  // Group translations by verse key
  const translationsByVerse = useMemo(() => {
    const byVerse = new Map<string, Translation[]>();
    for (const t of translations) {
      if (!preferences.activeTranslationIds.includes(t.resourceId)) continue;
      const existing = byVerse.get(t.verseKey) ?? [];
      existing.push(t);
      byVerse.set(t.verseKey, existing);
    }
    return byVerse;
  }, [translations, preferences.activeTranslationIds]);

  // Desktop: pairs of pages (spread). Mobile: single page.
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const totalSpreads = isMobile ? pages.length : Math.ceil(pages.length / 2);

  const goNext = useCallback(() => {
    setAnimDir("left");
    setCurrentSpread((s) => Math.min(s + 1, totalSpreads - 1));
  }, [totalSpreads]);

  const goPrev = useCallback(() => {
    setAnimDir("right");
    setCurrentSpread((s) => Math.max(s - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if (e.key === "ArrowRight" || e.key === "j" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "k") {
        e.preventDefault();
        goPrev();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Get current visible pages
  const visiblePages = useMemo(() => {
    if (isMobile) {
      return [pages[currentSpread]].filter(Boolean) as MushafPage[];
    }
    const leftIdx = currentSpread * 2;
    const rightIdx = leftIdx + 1;
    return [pages[leftIdx], pages[rightIdx]].filter(Boolean) as MushafPage[];
  }, [pages, currentSpread, isMobile]);

  const rightPage = visiblePages[0];
  const leftPage = visiblePages[1];

  return (
    <div className="relative h-full overflow-hidden">
      <div className={isMobile ? "" : "mushaf-spread"}>
        {/* Right page — Arabic (RTL) */}
        {rightPage && (
          <div
            key={`right-${rightPage.pageNumber}`}
            className={`mushaf-page mushaf-page-right ${animDir === "left" ? "mushaf-page-enter-right" : animDir === "right" ? "mushaf-page-enter-right" : ""}`}
          >
            <div className="space-y-3">
              {rightPage.verses.map((verse) => (
                <div key={verse.verseKey} data-verse-key={verse.verseKey}>
                  <p
                    lang="ar"
                    dir="rtl"
                    className="arabic-reading text-foreground"
                    style={{ fontSize: "clamp(1.25rem, 3.5vw, 2.25rem)", lineHeight: 2.4 }}
                  >
                    {verse.textUthmani}
                    <span className="verse-number-ornament">
                      {toArabicNumerals(verse.verseNumber)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <span className="mushaf-page-number">{rightPage.pageNumber}</span>
          </div>
        )}

        {/* Left page — Translation (LTR), desktop only */}
        {leftPage && !isMobile && preferences.showTranslation && (
          <div
            key={`left-${leftPage.pageNumber}`}
            className={`mushaf-page mushaf-page-left ${animDir === "left" ? "mushaf-page-enter-left" : animDir === "right" ? "mushaf-page-enter-left" : ""}`}
          >
            <div className="space-y-4">
              {leftPage.verses.map((verse) => {
                const verseTrans = translationsByVerse.get(verse.verseKey) ?? [];
                return (
                  <div key={verse.verseKey}>
                    {verseTrans.map((t) => {
                      const html = sanitizeHtml(t.text);
                      const plainText = html.replace(/<[^>]+>/g, "");
                      return (
                        <p
                          key={t.resourceId}
                          className="text-sm leading-[1.8] text-muted-foreground/80"
                        >
                          <span className="text-[0.6em] align-super text-muted-foreground/40 font-mono select-none mr-1">
                            {verse.verseNumber}
                          </span>
                          {plainText}
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <span className="mushaf-page-number">{leftPage.pageNumber}</span>
          </div>
        )}

        {/* Mobile: single page shows Arabic then translations below */}
        {isMobile && rightPage && preferences.showTranslation && (
          <div className="mushaf-page mushaf-page-left mt-4">
            <div className="space-y-3">
              {rightPage.verses.map((verse) => {
                const verseTrans = translationsByVerse.get(verse.verseKey) ?? [];
                return (
                  <div key={verse.verseKey}>
                    {verseTrans.map((t) => {
                      const plainText = sanitizeHtml(t.text).replace(/<[^>]+>/g, "");
                      return (
                        <p
                          key={t.resourceId}
                          className="text-sm leading-[1.8] text-muted-foreground/80"
                        >
                          <span className="text-[0.6em] align-super text-muted-foreground/40 font-mono select-none mr-1">
                            {verse.verseNumber}
                          </span>
                          {plainText}
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Page navigation */}
      <div className="mushaf-nav">
        <button
          onClick={goPrev}
          disabled={currentSpread === 0}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-30"
          aria-label="Previous page"
        >
          <CaretLeftIcon weight="bold" className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted-foreground/60 font-mono tabular-nums">
          {currentSpread + 1} / {totalSpreads}
        </span>
        <button
          onClick={goNext}
          disabled={currentSpread >= totalSpreads - 1}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-30"
          aria-label="Next page"
        >
          <CaretRightIcon weight="bold" className="h-4 w-4" />
        </button>
      </div>

      <ReadingToolbar />
    </div>
  );
}
