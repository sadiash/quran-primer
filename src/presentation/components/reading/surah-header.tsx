"use client";

import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon, PlayIcon } from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";
import type { Surah } from "@/core/types";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { cn } from "@/lib/utils";

interface SurahHeaderProps {
  surah: Surah;
  compact?: boolean;
}

export function SurahHeader({ surah, compact = false }: SurahHeaderProps) {
  const audio = useAudioPlayer();
  const hasPrev = surah.id > 1;
  const hasNext = surah.id < 114;

  return (
    <div className="text-center">
      {/* ── Compact header (scrolled state) ── */}
      <div
        className={cn(
          "flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 overflow-hidden",
          compact ? "max-h-14 opacity-100 py-2" : "max-h-0 opacity-0",
        )}
      >
        <NavChevron
          href={hasPrev ? `/surah/${surah.id - 1}` : "#"}
          disabled={!hasPrev}
          direction="prev"
          small
        />
        <span className="text-[10px] font-semibold text-primary/50 tabular-nums">
          {surah.id}
        </span>
        <h2 lang="ar" dir="rtl" className="arabic-display text-lg text-foreground leading-normal">
          {surah.nameArabic}
        </h2>
        <span className="text-primary/20 text-xs select-none">&middot;</span>
        <span className="text-sm text-muted-foreground/70 italic">
          {surah.nameSimple}
        </span>
        <NavChevron
          href={hasNext ? `/surah/${surah.id + 1}` : "#"}
          disabled={!hasNext}
          direction="next"
          small
        />
      </div>

      {/* ── Expanded header (at-top state) ── */}
      <div
        className={cn(
          "transition-all duration-300 overflow-hidden",
          compact ? "max-h-0 opacity-0" : "max-h-[22rem] opacity-100",
        )}
      >
        <div className="header-reveal py-5">
          {/* Arabic name — THE hero element */}
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <NavChevron
              href={hasPrev ? `/surah/${surah.id - 1}` : "#"}
              disabled={!hasPrev}
              direction="prev"
            />

            <div className="flex flex-col items-center">
              {/* Surah number — small, above Arabic */}
              <span className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary/60 tabular-nums">
                Surah {surah.id}
              </span>

              <h1 lang="ar" dir="rtl" className="arabic-display surah-title-arabic">
                {surah.nameArabic}
              </h1>
            </div>

            <NavChevron
              href={hasNext ? `/surah/${surah.id + 1}` : "#"}
              disabled={!hasNext}
              direction="next"
            />
          </div>

          {/* English name */}
          <p className="mt-1 text-[15px] tracking-wide text-muted-foreground">
            <span className="font-medium">{surah.nameSimple}</span>
            <span className="mx-2 text-border">—</span>
            <span className="italic text-muted-foreground/70">{surah.nameTranslation}</span>
          </p>

          {/* Metadata */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px]">
            <span className="font-semibold uppercase tracking-widest text-primary/60">
              {surah.revelationType === "makkah" ? "Meccan" : "Medinan"}
            </span>
            <span className="text-primary/25">&middot;</span>
            <span className="text-muted-foreground/60 tabular-nums">
              {surah.versesCount} verses
            </span>
            <span className="text-primary/25">&middot;</span>
            <button
              onClick={() => audio.play(`${surah.id}:1`, surah.id)}
              className="inline-flex items-center gap-1 font-semibold text-primary/70 hover:text-primary transition-colors"
              aria-label="Play surah"
            >
              <PlayIcon weight="fill" className="h-3 w-3" />
              Play
            </button>
          </div>

          {/* Thin rule */}
          <div className="mx-auto mt-5 max-w-48">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-l from-border/60 to-transparent" />
              <div className="h-1 w-1 rounded-full bg-primary/30" />
              <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Navigation Chevron ─── */

function NavChevron({
  href,
  disabled,
  direction,
  small,
}: {
  href: string;
  disabled: boolean;
  direction: "prev" | "next";
  small?: boolean;
}) {
  const Icon = direction === "prev" ? CaretLeftIcon : CaretRightIcon;
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full transition-all shrink-0",
        small ? "p-1" : "p-2",
        disabled
          ? "pointer-events-none opacity-0"
          : "text-muted-foreground/30 hover:text-foreground hover:bg-surface-hover",
      )}
      aria-label={direction === "prev" ? "Previous surah" : "Next surah"}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      <Icon weight="bold" className={cn(small ? "h-3.5 w-3.5" : "h-4 w-4")} />
    </Link>
  );
}

/* ─── Vine Border — Repeating arabesque pattern for side margins ─── */

export function VineBorder({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={cn(
        "absolute top-0 bottom-0 w-7 pointer-events-none hidden lg:block",
        side === "left" ? "left-0" : "right-0",
      )}
    >
      <svg className="h-full w-full text-primary/[0.25]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={`vine-${side}`}
            width="28"
            height="140"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M14,0 C19,12 9,24 14,36 C19,48 6,58 14,70 C22,82 9,92 14,104 C19,116 9,128 14,140"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            <path d="M14,18 C8,12 2,15 4,22 C5,26 10,25 13,22 Q14,20 14,18" fill="currentColor" opacity="0.6" />
            <path d="M14,88 C8,82 2,85 4,92 C5,96 10,95 13,92 Q14,90 14,88" fill="currentColor" opacity="0.5" />
            <path d="M14,52 C20,46 26,49 24,56 C23,60 18,59 15,56 Q14,54 14,52" fill="currentColor" opacity="0.55" />
            <path d="M14,122 C20,116 26,119 24,126 C23,130 18,129 15,126 Q14,124 14,122" fill="currentColor" opacity="0.45" />
            <circle cx="3" cy="19" r="2.5" fill="currentColor" opacity="0.25" />
            <circle cx="25" cy="53" r="2.5" fill="currentColor" opacity="0.25" />
            <circle cx="3" cy="89" r="2" fill="currentColor" opacity="0.2" />
            <circle cx="25" cy="123" r="2" fill="currentColor" opacity="0.2" />
            <path d="M4,22 C1,27 -1,24 2,21" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M24,56 C27,61 29,58 26,55" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M14,5 C11,3 9,5 11,8 C12,9 13,8 14,6" fill="currentColor" opacity="0.3" />
            <path d="M14,36 C17,34 19,36 17,39 C16,40 15,39 14,37" fill="currentColor" opacity="0.3" />
            <path d="M14,70 C11,68 9,70 11,73 C12,74 13,73 14,71" fill="currentColor" opacity="0.3" />
            <path d="M14,104 C17,102 19,104 17,107 C16,108 15,107 14,105" fill="currentColor" opacity="0.3" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#vine-${side})`}
          transform={side === "right" ? "scale(-1,1) translate(-28,0)" : undefined}
        />
      </svg>
    </div>
  );
}
