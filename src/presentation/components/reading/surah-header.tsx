"use client";

import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon, PlayIcon } from "@phosphor-icons/react";
import type { Surah } from "@/core/types";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { getSurahColor } from "@/lib/surah-colors";
import { cn } from "@/lib/utils";

interface SurahHeaderProps {
  surah: Surah;
  compact?: boolean;
}

export function SurahHeader({ surah, compact = false }: SurahHeaderProps) {
  const audio = useAudioPlayer();
  const hasPrev = surah.id > 1;
  const hasNext = surah.id < 114;
  const accent = getSurahColor(surah.id);

  return (
    <div className="text-center">
      {/* Compact header (scrolled state) */}
      <div
        className={cn(
          "flex items-center justify-center gap-3 transition-all duration-200 overflow-hidden",
          compact ? "max-h-14 opacity-100 py-2" : "max-h-0 opacity-0",
        )}
      >
        <NavChevron href={hasPrev ? `/surah/${surah.id - 1}` : "#"} disabled={!hasPrev} direction="prev" small />
        <span
          className="font-mono text-[10px] font-bold tabular-nums px-2 py-0.5"
          style={{ backgroundColor: accent.accent, color: "#0a0a0a" }}
        >
          {surah.id}
        </span>
        <h2 lang="ar" dir="rtl" className="arabic-display text-lg text-foreground leading-normal">
          {surah.nameArabic}
        </h2>
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          {surah.nameSimple}
        </span>
        <NavChevron href={hasNext ? `/surah/${surah.id + 1}` : "#"} disabled={!hasNext} direction="next" small />
      </div>

      {/* Expanded header (at-top state) */}
      <div
        className={cn(
          "transition-all duration-200 overflow-hidden",
          compact ? "max-h-0 opacity-0" : "max-h-[22rem] opacity-100",
        )}
      >
        <div className="header-reveal py-6">
          {/* Number pill — bold accent color */}
          <span
            className="inline-block font-mono text-sm font-bold px-4 py-1 mb-4"
            style={{ backgroundColor: accent.accent, color: "#0a0a0a" }}
          >
            {String(surah.id).padStart(3, "0")}
          </span>

          {/* Arabic name — THE hero element */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <NavChevron href={hasPrev ? `/surah/${surah.id - 1}` : "#"} disabled={!hasPrev} direction="prev" />

            <h1 lang="ar" dir="rtl" className="arabic-display surah-title-arabic">
              {surah.nameArabic}
            </h1>

            <NavChevron href={hasNext ? `/surah/${surah.id + 1}` : "#"} disabled={!hasNext} direction="next" />
          </div>

          {/* English name — large, bold */}
          <p className="mt-3 text-2xl font-bold tracking-tight text-foreground uppercase">
            {surah.nameSimple}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {surah.nameTranslation}
          </p>

          {/* Metadata — colored strip */}
          <div
            className="inline-flex items-center gap-4 mt-4 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: accent.bg, color: accent.text }}
          >
            <span>
              {surah.revelationType === "makkah" ? "MECCAN" : "MEDINAN"}
            </span>
            <span className="opacity-30">|</span>
            <span className="tabular-nums">
              {surah.versesCount} VERSES
            </span>
            <span className="opacity-30">|</span>
            <button
              onClick={() => audio.play(`${surah.id}:1`, surah.id)}
              className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
              aria-label="Play surah"
            >
              <PlayIcon weight="fill" className="h-3 w-3" />
              PLAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        "transition-colors shrink-0 border border-border",
        small ? "p-0.5" : "p-1.5",
        disabled
          ? "pointer-events-none opacity-0"
          : "text-muted-foreground hover:text-foreground hover:border-foreground",
      )}
      aria-label={direction === "prev" ? "Previous surah" : "Next surah"}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      <Icon weight="bold" className={cn(small ? "h-3.5 w-3.5" : "h-4 w-4")} />
    </Link>
  );
}

/** @deprecated Vine borders removed in brutalist redesign */
export function VineBorder(_props: { side: "left" | "right" }) {
  return null;
}
