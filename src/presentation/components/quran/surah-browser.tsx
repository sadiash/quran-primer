"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon, GridFourIcon, ListBulletsIcon, MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react";
import type { Surah, ReadingProgress } from "@/core/types";
import { useProgress } from "@/presentation/hooks/use-progress";
import { usePreferences } from "@/presentation/hooks/use-preferences";
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
  const { allProgress } = useProgress();
  const { preferences } = usePreferences();

  const progressMap = useMemo(() => {
    const map = new Map<number, ReadingProgress>();
    for (const p of allProgress) map.set(p.surahId, p);
    return map;
  }, [allProgress]);

  const verseMatch = useMemo(() => {
    const m = search.match(/^(\d{1,3}):(\d{1,3})$/);
    if (!m) return null;
    const surahId = Number(m[1]);
    const verse = Number(m[2]);
    const surah = surahs.find((s) => s.id === surahId);
    if (!surah || verse < 1 || verse > surah.versesCount) return null;
    return { surah, verse, key: `${surahId}:${verse}` };
  }, [search, surahs]);

  const filtered = useMemo(() => {
    if (verseMatch) return [];
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
  }, [surahs, search, filter, verseMatch]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon weight="duotone" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, number, or verse (2:255)..."
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
              <GridFourIcon weight={view === "grid" ? "fill" : "duotone"} className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "rounded-r-lg p-1.5 transition-colors",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="List view"
            >
              <ListBulletsIcon weight={view === "list" ? "fill" : "duotone"} className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Verse jump */}
      {verseMatch && (
        <Link
          href={`/surah/${verseMatch.surah.id}?verse=${verseMatch.key}`}
          className="flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-all hover:bg-primary/10 hover:shadow-soft-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ArrowRightIcon weight="bold" className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Go to {verseMatch.surah.nameSimple}, Verse {verseMatch.verse}
            </p>
            <p className="text-xs text-muted-foreground">
              Surah {verseMatch.surah.id} — {verseMatch.surah.nameTranslation}
            </p>
          </div>
          <p className="shrink-0 font-[family-name:var(--font-arabic-reading)] text-base text-foreground">
            {verseMatch.surah.nameArabic}
          </p>
        </Link>
      )}

      {/* Count */}
      {!verseMatch && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {surahs.length} surahs
        </p>
      )}

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
              <SurahProgressBadge surah={surah} progress={preferences.trackProgress ? progressMap.get(surah.id) : undefined} />
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
                    <MapPinIcon weight="bold" className="h-3 w-3" />
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
        /* List view */
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
                <MapPinIcon weight="bold" className="h-3 w-3" />
                {surah.revelationType === "makkah" ? "Meccan" : "Medinan"}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {surah.versesCount}v
              </span>
              {preferences.trackProgress && (() => {
                const p = progressMap.get(surah.id);
                if (!p) return null;
                const isComplete = p.completedVerses >= p.totalVerses;
                if (isComplete) {
                  return <CheckCircleIcon weight="fill" className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(var(--primary))" }} />;
                }
                const pct = Math.round((p.completedVerses / p.totalVerses) * 100);
                return (
                  <span className="shrink-0 text-[10px] font-medium" style={{ color: "hsl(var(--primary))" }}>
                    {pct}%
                  </span>
                );
              })()}
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 && !verseMatch && search && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No surahs match &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}

/* ─── SVG ring progress badge for grid view ─── */

function SurahProgressBadge({ surah, progress }: { surah: Surah; progress?: ReadingProgress }) {
  const size = 40;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (!progress) {
    // Unread — plain badge
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
        {surah.id}
      </div>
    );
  }

  const isComplete = progress.completedVerses >= progress.totalVerses;
  const fraction = Math.min(progress.completedVerses / progress.totalVerses, 1);

  if (isComplete) {
    // Complete — filled primary circle
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
      >
        {surah.id}
      </div>
    );
  }

  // Partial — arc stroke ring
  const dashOffset = circumference * (1 - fraction);

  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          style={{ stroke: "hsl(var(--primary) / 0.15)" }}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            stroke: "hsl(var(--primary))",
            strokeDasharray: circumference,
            strokeDashoffset: dashOffset,
            transition: "stroke-dashoffset 0.3s ease",
          }}
        />
      </svg>
      <span className="relative text-sm font-bold text-primary">{surah.id}</span>
    </div>
  );
}
