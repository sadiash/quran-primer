"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Surah } from "@/core/types";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { cn } from "@/lib/utils";

interface SurahHeaderProps {
  surah: Surah;
  showBismillah?: boolean;
}

export function SurahHeader({ surah, showBismillah = true }: SurahHeaderProps) {
  const audio = useAudioPlayer();
  const hasPrev = surah.id > 1;
  const hasNext = surah.id < 114;

  return (
    <div className="header-reveal text-center pb-6 pt-2">
      {/* Surah number — small, elegant */}
      <div className="mb-3">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-primary/15 text-[10px] font-medium text-primary/50 tracking-wide">
          {surah.id}
        </span>
      </div>

      {/* Arabic name with prev/next chevrons */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <Link
          href={hasPrev ? `/surah/${surah.id - 1}` : "#"}
          className={cn(
            "rounded-full p-2 transition-all",
            hasPrev
              ? "text-muted-foreground/30 hover:text-foreground hover:bg-surface-hover"
              : "pointer-events-none opacity-0",
          )}
          aria-label="Previous surah"
          aria-disabled={!hasPrev}
          tabIndex={hasPrev ? 0 : -1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <h1
          lang="ar"
          dir="rtl"
          className="arabic-display surah-title-arabic"
        >
          {surah.nameArabic}
        </h1>

        <Link
          href={hasNext ? `/surah/${surah.id + 1}` : "#"}
          className={cn(
            "rounded-full p-2 transition-all",
            hasNext
              ? "text-muted-foreground/30 hover:text-foreground hover:bg-surface-hover"
              : "pointer-events-none opacity-0",
          )}
          aria-label="Next surah"
          aria-disabled={!hasNext}
          tabIndex={hasNext ? 0 : -1}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* English name — serif display typography */}
      <p className="mt-2 text-base tracking-wide text-muted-foreground/70 font-light serif-display">
        {surah.nameSimple}
        <span className="mx-2 text-border/40">—</span>
        <span className="italic">{surah.nameTranslation}</span>
      </p>

      {/* Metadata: elegant, spaced */}
      <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-muted-foreground/50 tracking-wide serif-display">
        <span className="uppercase">{surah.revelationType === "makkah" ? "Meccan" : "Medinan"}</span>
        <span className="text-primary/20">·</span>
        <span>{surah.versesCount} verses</span>
        <span className="text-primary/20">·</span>
        <button
          onClick={() => audio.play(`${surah.id}:1`, surah.id)}
          className="inline-flex items-center gap-1 text-primary/50 hover:text-primary transition-all"
          aria-label="Play surah"
        >
          <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
          Play
        </button>
      </div>

      {/* Ornamental divider — refined */}
      <div className="surah-divider mt-6">
        <span className="px-4 text-primary/20 text-[10px] select-none tracking-[0.5em]">&#x2727;</span>
      </div>

      {/* Bismillah with ornament frame */}
      {showBismillah && surah.id !== 1 && surah.id !== 9 && (
        <div className="bismillah-ornament mt-4">
          <p
            lang="ar"
            dir="rtl"
            className="arabic-display text-2xl text-foreground/60 sm:text-3xl"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}
    </div>
  );
}
