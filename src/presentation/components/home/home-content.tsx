"use client";

import Link from "next/link";
import {
  BookOpenText,
  ArrowRight,
  Search,
  Bookmark,
  StickyNote,
  Brain,
  BookText,
} from "lucide-react";
import { useProgress } from "@/presentation/hooks/use-progress";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { useCommandPalette } from "@/presentation/hooks/use-command-palette";
import { cn } from "@/lib/utils";

const QUICK_SURAHS = [
  { id: 1, name: "Al-Fatihah", arabic: "الفاتحة" },
  { id: 2, name: "Al-Baqarah", arabic: "البقرة" },
  { id: 18, name: "Al-Kahf", arabic: "الكهف" },
  { id: 36, name: "Ya-Sin", arabic: "يس" },
  { id: 55, name: "Ar-Rahman", arabic: "الرحمن" },
  { id: 67, name: "Al-Mulk", arabic: "الملك" },
  { id: 112, name: "Al-Ikhlas", arabic: "الاخلاص" },
  { id: 114, name: "An-Nas", arabic: "الناس" },
];

export function HomeContent() {
  const { allProgress, getLatestProgress } = useProgress();
  const { bookmarks } = useBookmarks();
  const { toggle: openPalette } = useCommandPalette();
  const latest = getLatestProgress();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Welcome header */}
      <div className="mb-10 text-center">
        <BookOpenText className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          Bismillah
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your study companion. Pick up where you left off.
        </p>
      </div>

      {/* Search bar (opens command palette) */}
      <button
        onClick={openPalette}
        className="mb-8 flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:shadow-soft-sm"
      >
        <Search className="h-4 w-4" />
        <span>Search surahs, verses, commands...</span>
        <kbd className="ml-auto rounded bg-muted px-2 py-0.5 text-[10px] font-medium">
          {"\u2318K"}
        </kbd>
      </button>

      {/* Continue Reading */}
      {latest && (
        <Link
          href={`/surahs/${latest.surahId}`}
          className="group mb-8 flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5 transition-all hover:shadow-soft-md hover:bg-primary/10"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BookText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              Continue Reading
            </p>
            <p className="mt-0.5 text-lg font-bold text-foreground">
              Surah {latest.surahId}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.round((latest.lastVerseNumber / latest.totalVerses) * 100)}%`,
                  }}
                />
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {latest.lastVerseNumber}/{latest.totalVerses}
              </span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-primary/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
      )}

      {/* Quick Surahs */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Popular Surahs</h2>
          <Link
            href="/surahs"
            className="text-xs text-primary hover:underline"
          >
            View all 114
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUICK_SURAHS.map((s) => (
            <Link
              key={s.id}
              href={`/surahs/${s.id}`}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3",
                "transition-all hover:shadow-soft-sm hover:border-primary/30",
              )}
            >
              <span className="font-[family-name:var(--font-arabic-display)] text-lg text-foreground">
                {s.arabic}
              </span>
              <span className="text-xs text-muted-foreground">{s.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Read */}
      {allProgress.length > 1 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Recently Read
          </h2>
          <div className="space-y-1.5">
            {allProgress.slice(0, 5).map((p) => (
              <Link
                key={p.surahId}
                href={`/surahs/${p.surahId}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-surface-hover"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                  {p.surahId}
                </span>
                <span className="flex-1 text-sm text-foreground">
                  Surah {p.surahId}
                </span>
                <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{
                      width: `${Math.round((p.lastVerseNumber / p.totalVerses) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {Math.round((p.lastVerseNumber / p.totalVerses) * 100)}%
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/surahs"
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-soft-sm hover:border-primary/30"
          >
            <BookOpenText className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">Browse</span>
          </Link>
          <Link
            href="/bookmarks"
            className="relative flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-soft-sm hover:border-primary/30"
          >
            <Bookmark className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">Bookmarks</span>
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                {bookmarks.length > 99 ? "99+" : bookmarks.length}
              </span>
            )}
          </Link>
          <Link
            href="/notes"
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-soft-sm hover:border-primary/30"
          >
            <StickyNote className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-foreground">Notes</span>
          </Link>
        </div>
      </section>

      {/* Knowledge hint */}
      <Link
        href="/knowledge"
        className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-border/60 p-4 text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
      >
        <Brain className="h-5 w-5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Knowledge Map</p>
          <p className="text-xs">See connections between your notes and bookmarks</p>
        </div>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
