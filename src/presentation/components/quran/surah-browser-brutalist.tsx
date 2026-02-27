"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Surah, ReadingProgress } from "@/core/types";
import { useProgress } from "@/presentation/hooks/use-progress";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { getSurahColor } from "@/lib/surah-colors";
import { BracketLabel, RadioOption } from "@/presentation/components/ui/bracket-helpers";
import { cn } from "@/lib/utils";

interface SurahBrowserBrutalistProps {
  surahs: Surah[];
}

type Filter = "all" | "meccan" | "medinan";
type SortMode = "number" | "revelation" | "verses" | "name";

/** Surahs with special significance in Islamic scholarship and practice */
const IMPORTANT_SURAHS = new Set([
  1,   // Al-Fatihah — "The Opening", recited in every prayer
  2,   // Al-Baqarah — longest surah, Ayatul Kursi
  3,   // Ali 'Imran — paired with Al-Baqarah
  12,  // Yusuf — "the best of stories"
  18,  // Al-Kahf — recommended weekly reading (Friday)
  19,  // Maryam — unique narrative
  36,  // Ya-Sin — "the heart of the Quran"
  55,  // Ar-Rahman — "which of your Lord's favors will you deny"
  56,  // Al-Waqi'ah — the Day of Judgment
  67,  // Al-Mulk — protection in the grave
  78,  // An-Naba — about the Hereafter
  112, // Al-Ikhlas — "worth a third of the Quran"
]);

export function SurahBrowserBrutalist({ surahs }: SurahBrowserBrutalistProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortMode>("number");
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
    let result = [...surahs];

    if (filter === "meccan")
      result = result.filter((s) => s.revelationType === "makkah");
    if (filter === "medinan")
      result = result.filter((s) => s.revelationType === "madinah");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.nameSimple.toLowerCase().includes(q) ||
          s.nameTranslation.toLowerCase().includes(q) ||
          s.id.toString() === q
      );
    }

    switch (sort) {
      case "revelation":
        result.sort((a, b) => {
          if (a.revelationType === b.revelationType) return a.id - b.id;
          return a.revelationType === "makkah" ? -1 : 1;
        });
        break;
      case "verses":
        result.sort((a, b) => b.versesCount - a.versesCount);
        break;
      case "name":
        result.sort((a, b) => a.nameSimple.localeCompare(b.nameSimple));
        break;
      default:
        break;
    }

    return result;
  }, [surahs, search, filter, sort, verseMatch]);

  const meccanCount = surahs.filter((s) => s.revelationType === "makkah").length;
  const medinanCount = surahs.length - meccanCount;

  return (
    <div className="relative z-10">
      {/* Top header */}
      <header className="border-b border-border px-6 py-5 sm:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1 block">
              The Primer / Browse
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-none text-foreground">
              114 Surahs
            </h1>
          </div>
          <div className="hidden sm:block text-right">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground leading-relaxed block">
              Browse the complete Quran.
              <br />
              {meccanCount} Meccan — {medinanCount} Medinan.
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className="shrink-0 border-b lg:border-b-0 lg:border-r border-border/20 w-full lg:w-[260px] px-6 py-6 sm:px-10 lg:px-6 lg:sticky lg:top-0 lg:h-[calc(100vh-120px)] lg:overflow-y-auto">
          {/* Search */}
          <div className="mb-8">
            <BracketLabel>Search</BracketLabel>
            <input
              type="text"
              placeholder="Name, number, or 2:255..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-b-2 border-foreground bg-transparent py-2 font-mono text-sm text-foreground outline-none placeholder:opacity-30"
            />
          </div>

          {/* Filter by origin */}
          <div className="mb-8">
            <BracketLabel>Filter by Origin</BracketLabel>
            <div className="space-y-2.5">
              <RadioOption
                selected={filter === "all"}
                onClick={() => setFilter("all")}
                label="All"
                suffix={`(${surahs.length})`}
              />
              <RadioOption
                selected={filter === "meccan"}
                onClick={() => setFilter("meccan")}
                label="● Meccan"
                dotColor="var(--surah-yellow-label)"
                suffix={`(${meccanCount})`}
              />
              <RadioOption
                selected={filter === "medinan"}
                onClick={() => setFilter("medinan")}
                label="● Medinan"
                dotColor="var(--surah-teal-label)"
                suffix={`(${medinanCount})`}
              />
            </div>
          </div>

          {/* Sort */}
          <div className="mb-8">
            <BracketLabel>Sort by</BracketLabel>
            <div className="space-y-2.5">
              {(
                [
                  { value: "number", label: "Surah Number" },
                  { value: "revelation", label: "Revelation Order" },
                  { value: "verses", label: "Verse Count" },
                  { value: "name", label: "Alphabetical" },
                ] as const
              ).map((s) => (
                <RadioOption
                  key={s.value}
                  selected={sort === s.value}
                  onClick={() => setSort(s.value)}
                  label={s.label}
                />
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setSearch("");
              setFilter("all");
              setSort("number");
            }}
            className="w-full border-2 border-foreground bg-transparent py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-foreground transition-opacity hover:opacity-60"
          >
            [ Reset to Default ]
          </button>
        </aside>

        {/* Main Grid */}
        <div className="flex-1 px-4 py-5 sm:px-6 lg:px-6">
          {/* Verse jump */}
          {verseMatch && (
            <Link
              href={`/surah/${verseMatch.surah.id}?verse=${verseMatch.key}`}
              className="flex items-center justify-between border-2 border-foreground p-5 mb-5 no-underline transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--br-accent-yellow)", color: "#0a0a0a" }}
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] block mb-1" style={{ color: "rgba(10,10,10,0.6)" }}>
                  Jump to Verse
                </span>
                <p className="font-display text-xl font-bold">
                  {verseMatch.surah.nameSimple} {verseMatch.verse}
                </p>
              </div>
              <p className="arabic-display text-2xl" dir="rtl">
                {verseMatch.surah.nameArabic}
              </p>
            </Link>
          )}

          {/* Result count bar */}
          {!verseMatch && (
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/20">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Showing {filtered.length} of {surahs.length}
              </span>
              {search && (
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Results for &ldquo;{search}&rdquo;
                </span>
              )}
            </div>
          )}

          {/* Card grid — fixed 3 columns */}
          <SurahGrid
            surahs={filtered}
            progressMap={progressMap}
            trackProgress={preferences.trackProgress}
          />

          {filtered.length === 0 && !verseMatch && search && (
            <div className="py-20 text-center">
              <p className="font-display text-5xl font-bold mb-2 text-foreground">
                0
              </p>
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                No surahs match &ldquo;{search}&rdquo;
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Grid — fixed 3 columns, no density toggle ─── */

function SurahGrid({
  surahs,
  progressMap,
  trackProgress,
}: {
  surahs: Surah[];
  progressMap: Map<number, ReadingProgress>;
  trackProgress: boolean;
}) {
  const layout = useMemo(() => {
    const result: { surah: Surah; featured: boolean }[] = [];
    let lastFeatured: boolean = false;

    for (const surah of surahs) {
      const wantsFeatured: boolean = IMPORTANT_SURAHS.has(surah.id);
      const isFeat: boolean = wantsFeatured && !lastFeatured;
      result.push({ surah, featured: isFeat });
      lastFeatured = isFeat;
    }
    return result;
  }, [surahs]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {layout.map(({ surah, featured }) => (
        <SurahCard
          key={surah.id}
          surah={surah}
          featured={featured}
          progress={trackProgress ? progressMap.get(surah.id) : undefined}
        />
      ))}
    </div>
  );
}

/* ─── Surah Card ─── */

function SurahCard({
  surah,
  featured,
  progress,
}: {
  surah: Surah;
  featured: boolean;
  progress?: ReadingProgress;
}) {
  const color = getSurahColor(surah.id);
  const isComplete = progress && progress.completedVerses >= progress.totalVerses;
  const pct = progress
    ? Math.round((progress.completedVerses / progress.totalVerses) * 100)
    : 0;

  const isBg = featured;

  return (
    <Link
      href={`/surah/${surah.id}`}
      className={cn(
        "group relative flex flex-col border overflow-hidden no-underline",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.03] hover:z-10 hover:shadow-md",
        isBg
          ? "border-transparent"
          : "border-border/20 bg-background text-foreground",
        featured ? "sm:col-span-2 min-h-[220px]" : "min-h-[160px]",
      )}
      style={{
        ...(isBg ? { backgroundColor: color.accent, color: "#0a0a0a" } : {}),
        // Hover fill handled via CSS custom property
        "--surah-hover-bg": color.bg,
        "--surah-hover-accent": color.accent,
      } as React.CSSProperties}
    >
      {/* Hover color fill — only on non-featured cards */}
      {!isBg && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-0"
          style={{ backgroundColor: color.bg }}
        />
      )}

      {/* Arabic watermark — right side, vertically centered above footer */}
      <p
        className={cn(
          "absolute right-3 select-none pointer-events-none transition-opacity duration-300 z-[4] arabic-display",
          featured
            ? "text-[6rem] sm:text-[8rem] opacity-[0.15] group-hover:opacity-[0.25] top-[10%] bottom-8"
            : "text-[3.5rem] sm:text-[4.5rem] opacity-[0.12] group-hover:opacity-[0.22] top-[5%] bottom-8",
        )}
        dir="rtl"
        aria-hidden="true"
        style={{
          color: isBg ? "#0a0a0a" : undefined,
          display: "flex",
          alignItems: "center",
          lineHeight: 1,
        }}
      >
        {surah.nameArabic}
      </p>

      {/* Top meta */}
      <div className="flex items-center gap-1.5 px-3 pt-3 relative z-[1]">
        {surah.revelationType === "makkah" ? (
          <KaabaIcon className="h-3 w-3" style={{ color: isBg ? "rgba(10,10,10,0.5)" : "var(--surah-yellow-label)" }} />
        ) : (
          <MasjidIcon className="h-3 w-3" style={{ color: isBg ? "rgba(10,10,10,0.5)" : "var(--surah-teal-label)" }} />
        )}
        <span className={cn("font-mono text-[9px] uppercase tracking-[0.15em]", isBg ? "text-[rgba(10,10,10,0.5)]" : "text-muted-foreground")}>
          {surah.revelationType === "makkah" ? "MECCAN" : "MEDINAN"}
        </span>
      </div>

      {/* Main text — pushed to bottom */}
      <div className="flex-1 flex flex-col justify-end px-3 pb-2 relative z-[1]">
        <p
          className={cn(
            "font-display font-bold leading-[1.1]",
            featured ? "text-[2.25rem]" : "text-[1.25rem]",
          )}
        >
          {surah.nameSimple}
        </p>
        <span className={cn("font-mono text-[10px] uppercase tracking-[0.15em] mt-0.5", isBg ? "text-[rgba(10,10,10,0.5)]" : "text-muted-foreground")}>
          {surah.nameTranslation}
        </span>
      </div>

      {/* Bottom bar */}
      <div className={cn("flex items-center justify-between border-t px-3 py-1.5 relative z-[1]", isBg ? "border-[rgba(10,10,10,0.1)]" : "border-border/20")}>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em]">
          <span className="font-bold">{String(surah.id).padStart(3, "0")}</span>
          <span className={cn("ml-1.5", isBg ? "text-[rgba(10,10,10,0.5)]" : "text-muted-foreground")}>{surah.versesCount}v</span>
        </span>
        {progress && isComplete && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.15em]"
            style={{ color: isBg ? "#0a0a0a" : "var(--surah-teal-label)" }}
          >
            DONE
          </span>
        )}
        {progress && !isComplete && (
          <span className="font-mono text-[10px] uppercase tracking-[0.15em]">
            {pct}%
          </span>
        )}
      </div>

      {/* Progress bar — fills from left */}
      {progress && pct > 0 && (
        <div
          className="absolute bottom-0 left-0 h-[2px] z-[2] transition-all duration-300"
          style={{
            width: `${isComplete ? 100 : pct}%`,
            backgroundColor: isBg ? "#0a0a0a" : color.accent,
          }}
        />
      )}

      {/* Hover accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-[3]"
        style={{ backgroundColor: isBg ? "#0a0a0a" : color.accent }}
      />
    </Link>
  );
}

/* ─── Kaaba icon (Meccan surahs) ─── */
function KaabaIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {/* Cube body */}
      <rect x="4" y="6" width="16" height="14" rx="0" />
      {/* Kiswa band */}
      <line x1="4" y1="11" x2="20" y2="11" />
      {/* Door */}
      <rect x="10" y="14" width="4" height="6" rx="0" />
      {/* Top cloth edge */}
      <path d="M4 6 L12 3 L20 6" />
    </svg>
  );
}

/* ─── Masjid al-Nabawi icon (Medinan surahs) ─── */
function MasjidIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {/* Central dome */}
      <path d="M7 12 Q12 4 17 12" />
      {/* Base */}
      <rect x="5" y="12" width="14" height="8" rx="0" />
      {/* Left minaret */}
      <line x1="3" y1="8" x2="3" y2="20" />
      <circle cx="3" cy="7" r="1" fill="currentColor" stroke="none" />
      {/* Right minaret */}
      <line x1="21" y1="8" x2="21" y2="20" />
      <circle cx="21" cy="7" r="1" fill="currentColor" stroke="none" />
      {/* Door */}
      <path d="M10 20 L10 16 Q12 14 14 16 L14 20" />
    </svg>
  );
}

