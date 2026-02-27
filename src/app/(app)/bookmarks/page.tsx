"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { BookmarkSimpleIcon, CircleNotchIcon, MagnifyingGlassIcon, TrashIcon } from "@phosphor-icons/react";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { getSurahName } from "@/lib/surah-names";
import { getSurahColor } from "@/lib/surah-colors";
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
          {/* Search */}
          <div className="relative mt-6">
            <MagnifyingGlassIcon weight="duotone" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by surah name, verse key, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground"
            />
          </div>

          {/* Surah filter chips */}
          {surahIds.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              <button
                onClick={() => setSurahFilter(null)}
                className="px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
                style={surahFilter === null ? {
                  backgroundColor: '#fefce8',
                  borderLeft: '3px solid #e8e337',
                  color: '#b5a600',
                } : {
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                All
              </button>
              {surahIds.map((id) => {
                const color = getSurahColor(id);
                return (
                  <button
                    key={id}
                    onClick={() =>
                      setSurahFilter(surahFilter === id ? null : id)
                    }
                    className="px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
                    style={surahFilter === id ? {
                      backgroundColor: color.bg,
                      borderLeft: `3px solid ${color.accent}`,
                      color: color.label,
                    } : {
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    {id}. {getSurahName(id)}
                  </button>
                );
              })}
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
          const surahColor = getSurahColor(bm.surahId);

          // Expanded card
          if (isExpanded) {
            return (
              <div
                key={bm.id}
                className="col-span-full border-2 bg-background"
                style={{ borderColor: surahColor.accent }}
              >
                {/* Header bar — matches ExpandedNoteCard */}
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: surahColor.label }}
                    >
                      {getSurahName(Number(surahNum))} {bm.verseKey}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/surah/${surahNum}?verse=${bm.verseKey}`}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-[#fefce8] transition-colors border border-border"
                    >
                      Read in context
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBookmark(bm.id);
                        setExpandedId(null);
                      }}
                      className="p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                      aria-label="Remove bookmark"
                    >
                      <TrashIcon weight="bold" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="ml-1 p-1.5 text-muted-foreground/50 hover:text-foreground transition-colors"
                      aria-label="Collapse"
                      title="Collapse"
                    >
                      <span className="font-mono text-[10px] font-bold">&times;</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 py-4 space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <CircleNotchIcon weight="bold" className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : verse ? (
                    <div className="space-y-3">
                      <p
                        className="text-right font-arabic-reading text-2xl leading-[2.2] text-foreground"
                        dir="rtl"
                      >
                        {verse.textUthmani}
                      </p>
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
                  {bm.note && (
                    <p className="text-xs text-muted-foreground">{bm.note}</p>
                  )}
                  <div className="font-mono text-[10px] text-muted-foreground/30">
                    {bm.createdAt.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>
            );
          }

          // Collapsed card — matches PageNoteCard
          return (
            <div
              key={bm.id}
              className={cn(
                "group relative border border-border bg-background p-4 transition-all hover:bg-[#fafafa] cursor-pointer",
                expandedId !== null && "opacity-40",
              )}
              style={{ borderLeft: `3px solid ${surahColor.accent}` }}
              onClick={() => toggleExpand(bm.id, bm.surahId)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: surahColor.accent }}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {getSurahName(Number(surahNum))} {bm.verseKey}
                  </span>
                </div>
                {bm.note && (
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                    {bm.note}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                  <span>{bm.createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {bookmarks.length === 0 && (
        <div className="mt-16 text-center">
          <BookmarkSimpleIcon weight="duotone" className="mx-auto h-10 w-10 text-muted-foreground/20" />
          <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
            No bookmarks yet. Bookmark verses while reading to see them here.
          </p>
          <Link
            href="/surah/1"
            className="mt-4 inline-block px-6 py-2 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:opacity-80"
            style={{ backgroundColor: '#e8e337' }}
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
