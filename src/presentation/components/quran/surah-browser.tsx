"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { GridFourIcon, ListBulletsIcon, MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react";
import type { Surah } from "@/core/types";
import { cn } from "@/lib/utils";

interface SurahBrowserProps {
  surahs: Surah[];
}

type ViewMode = "grid" | "list";
type Filter = "all" | "meccan" | "medinan";

export function SurahBrowser({ surahs }: SurahBrowserProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let result = surahs;
    if (filter === "meccan") result = result.filter((s) => s.revelationType === "makkah");
    if (filter === "medinan") result = result.filter((s) => s.revelationType === "madinah");
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.nameSimple.toLowerCase().includes(q) ||
          s.nameTranslation.toLowerCase().includes(q) ||
          s.id.toString() === q,
      );
    }
    return result;
  }, [surahs, search, filter]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* MagnifyingGlassIcon */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="MagnifyingGlassIcon by name, translation, or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border">
            {(["all", "meccan", "medinan"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  f === "all" && "rounded-l-lg",
                  f === "medinan" && "rounded-r-lg",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="hidden sm:flex rounded-lg border border-border">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "rounded-l-lg p-1.5 transition-colors",
                view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Grid view"
            >
              <GridFourIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "rounded-r-lg p-1.5 transition-colors",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="ListBulletsIcon view"
            >
              <ListBulletsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} of {surahs.length} surahs
      </p>

      {/* Grid view */}
      {view === "grid" ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className={cn(
                "group flex items-center gap-4 rounded-xl border border-border bg-card p-4",
                "transition-all hover:shadow-soft-sm hover:border-primary/30",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {surah.id}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {surah.nameSimple}
                  </p>
                  <p className="shrink-0 text-right font-[family-name:var(--font-arabic-reading)] text-base text-foreground">
                    {surah.nameArabic}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{surah.nameTranslation}</span>
                  <span className="text-border">|</span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    {surah.revelationType === "makkah" ? "Meccan" : "Medinan"}
                  </span>
                  <span className="text-border">|</span>
                  <span>{surah.versesCount} verses</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* ListBulletsIcon view */
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {filtered.map((surah) => (
            <Link
              key={surah.id}
              href={`/surah/${surah.id}`}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-hover"
            >
              <span className="w-8 shrink-0 text-right text-sm font-bold text-primary">
                {surah.id}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {surah.nameSimple}
                </span>
                <span className="mx-2 text-border">—</span>
                <span className="text-xs text-muted-foreground">
                  {surah.nameTranslation}
                </span>
              </div>
              <span className="hidden sm:inline font-[family-name:var(--font-arabic-reading)] text-base text-foreground">
                {surah.nameArabic}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPinIcon className="h-3 w-3" />
                {surah.revelationType === "makkah" ? "Meccan" : "Medinan"}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {surah.versesCount}v
              </span>
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No surahs match &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}
