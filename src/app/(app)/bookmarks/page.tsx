"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Bookmark, Search, Trash2 } from "lucide-react";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { getSurahName } from "@/lib/surah-names";
import { cn } from "@/lib/utils";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const [search, setSearch] = useState("");
  const [surahFilter, setSurahFilter] = useState<number | null>(null);

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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <div className="flex items-center gap-3">
        <Bookmark className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bookmarks</h1>
          <p className="text-sm text-muted-foreground">
            {bookmarks.length} bookmarked verse{bookmarks.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {bookmarks.length > 0 && (
        <>
          {/* Search */}
          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by surah name, verse key, or note..."
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

      {/* Bookmark cards */}
      <div className="mt-6 space-y-2">
        {filtered.map((bm) => {
          const [surahNum, verseNum] = bm.verseKey.split(":");
          return (
            <div
              key={bm.id}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-soft-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {verseNum}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/surah/${surahNum}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-fast"
                >
                  {getSurahName(Number(surahNum))} — Verse {verseNum}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {bm.verseKey}
                </p>
                {bm.note && (
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {bm.note}
                  </p>
                )}
                <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                  {bm.createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => removeBookmark(bm.id)}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition-fast hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                aria-label="Remove bookmark"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {bookmarks.length === 0 && (
        <div className="mt-16 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            No bookmarks yet. Bookmark verses while reading to see them here.
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
