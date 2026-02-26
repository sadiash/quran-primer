"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { BookmarkSimpleIcon, CaretDownIcon, CircleNotchIcon, MagnifyingGlassIcon, TrashIcon } from "@phosphor-icons/react";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { getSurahName } from "@/lib/surah-names";
import type { Verse, Translation } from "@/core/types";
import { cn } from "@/lib/utils";

/** Default translation to show in expanded bookmarks */
const DEFAULT_TRANSLATION_ID = 1001;

interface CachedSurah {
  verses: Verse[];
  translations: Translation[];
}

function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["sup", "sub", "b", "i", "em", "strong", "br", "span"],
    ALLOWED_ATTR: ["class"],
  });
}

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const [search, setSearch] = useState("");
  const [surahFilter, setSurahFilter] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingSurah, setLoadingSurah] = useState<number | null>(null);

  // Cache fetched surah data to avoid re-fetching
  const surahCache = useRef<Map<number, CachedSurah>>(new Map());

  const fetchSurahData = useCallback(async (surahId: number) => {
    if (surahCache.current.has(surahId)) return;
    setLoadingSurah(surahId);
    try {
      const res = await fetch(
        `/api/v1/surahs/${surahId}?translation=${DEFAULT_TRANSLATION_ID}`,
      );
      const json = await res.json();
      if (json.ok) {
        surahCache.current.set(surahId, {
          verses: json.data.surah.verses,
          translations: json.data.translations,
        });
      }
    } finally {
      setLoadingSurah(null);
    }
  }, []);

  const toggleExpand = useCallback(
    async (bookmarkId: string, surahId: number) => {
      if (expandedId === bookmarkId) {
        setExpandedId(null);
        return;
      }
      setExpandedId(bookmarkId);
      await fetchSurahData(surahId);
    },
    [expandedId, fetchSurahData],
  );

  // Unique surah IDs for filter chips
  const surahIds = useMemo(() => {
    const ids = [...new Set(bookmarks.map((b) => b.surahId))].sort(
      (a, b) => a - b,
    );
    return ids;
  }, [bookmarks]);

  const filtered = useMemo(() => {
    let result = bookmarks;
    if (surahFilter !== null) {
      result = result.filter((b) => b.surahId === surahFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => {
        const name = getSurahName(b.surahId).toLowerCase();
        return (
          name.includes(q) ||
          b.verseKey.includes(q) ||
          b.note.toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [bookmarks, search, surahFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Bookmarks"
        subtitle={`${bookmarks.length} bookmarked verse${bookmarks.length !== 1 ? "s" : ""}`}
        icon={BookmarkSimpleIcon}
      />

      {bookmarks.length > 0 && (
        <>
          {/* MagnifyingGlassIcon */}
          <div className="relative mt-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="MagnifyingGlassIcon by surah name, verse key, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Surah filter chips */}
          {surahIds.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              <button
                onClick={() => setSurahFilter(null)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-fast",
                  surahFilter === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                )}
              >
                All
              </button>
              {surahIds.map((id) => (
                <button
                  key={id}
                  onClick={() =>
                    setSurahFilter(surahFilter === id ? null : id)
                  }
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-fast",
                    surahFilter === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  {id}. {getSurahName(id)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* BookmarkSimpleIcon cards */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((bm) => {
          const [surahNum, verseNum] = bm.verseKey.split(":");
          const isExpanded = expandedId === bm.id;
          const cached = surahCache.current.get(bm.surahId);
          const verse = cached?.verses.find(
            (v) => v.verseKey === bm.verseKey,
          );
          const translation = cached?.translations.find(
            (t) => t.verseKey === bm.verseKey,
          );
          const isLoading = loadingSurah === bm.surahId && !cached;

          return (
            <div
              key={bm.id}
              className={cn(
                "group relative rounded-xl border bg-card transition-all",
                isExpanded
                  ? "border-primary/30 shadow-soft-sm col-span-1 sm:col-span-2 lg:col-span-3"
                  : "border-border hover:border-primary/30 hover:shadow-soft-sm",
              )}
            >
              {/* Card header — clickable to expand */}
              <button
                type="button"
                onClick={() => toggleExpand(bm.id, bm.surahId)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {verseNum}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {getSurahName(Number(surahNum))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verse {verseNum}
                  </p>
                  {bm.note && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {bm.note}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <CaretDownIcon
                    className={cn(
                      "h-4 w-4 text-muted-foreground/50 transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </div>
              </button>

              {/* Expanded verse content */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <CircleNotchIcon className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : verse ? (
                    <div className="space-y-3">
                      {/* Arabic text */}
                      <p
                        className="text-right font-arabic-reading text-2xl leading-[2.2] text-foreground"
                        dir="rtl"
                      >
                        {verse.textUthmani}
                      </p>

                      {/* Translation */}
                      {translation && (
                        <div className="border-t border-border/50 pt-3">
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                            {translation.resourceName}
                          </p>
                          <p
                            className="text-sm leading-relaxed text-muted-foreground"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeHtml(translation.text),
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Could not load verse content.
                    </p>
                  )}

                  {/* Actions row */}
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground/60">
                      {bm.createdAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/surah/${surahNum}?verse=${bm.verseKey}`}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-fast"
                      >
                        Read in context
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBookmark(bm.id);
                          setExpandedId(null);
                        }}
                        className="rounded-md p-1.5 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-fast"
                        aria-label="Remove bookmark"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsed: show date and delete on hover */}
              {!isExpanded && (
                <div className="flex items-center justify-between px-4 pb-3">
                  <p className="text-[10px] text-muted-foreground/60">
                    {bm.createdAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(bm.id);
                    }}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition-fast hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    aria-label="Remove bookmark"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {bookmarks.length === 0 && (
        <div className="mt-16 text-center">
          <BookmarkSimpleIcon className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            No bookmarks yet. BookmarkSimpleIcon verses while reading to see them here.
          </p>
          <Link
            href="/surah/1"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-fast"
          >
            Start reading
          </Link>
        </div>
      )}

      {bookmarks.length > 0 && filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No bookmarks match your search.
        </p>
      )}
    </div>
  );
}
