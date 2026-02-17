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
    <div className="text-center pb-2">
      {/* Arabic name with prev/next chevrons */}
      <div className="flex items-center justify-center gap-3">
        <Link
          href={hasPrev ? `/surah/${surah.id - 1}` : "#"}
          className={cn(
            "rounded-md p-1 transition-fast",
            hasPrev
              ? "text-muted-foreground/50 hover:text-foreground hover:bg-surface-hover"
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
          className="arabic-display text-3xl text-foreground sm:text-4xl"
        >
          {surah.nameArabic}
        </h1>

        <Link
          href={hasNext ? `/surah/${surah.id + 1}` : "#"}
          className={cn(
            "rounded-md p-1 transition-fast",
            hasNext
              ? "text-muted-foreground/50 hover:text-foreground hover:bg-surface-hover"
              : "pointer-events-none opacity-0",
          )}
          aria-label="Next surah"
          aria-disabled={!hasNext}
          tabIndex={hasNext ? 0 : -1}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* English name + translation merged on one line */}
      <p className="mt-1 text-sm text-muted-foreground">
        {surah.nameSimple} — {surah.nameTranslation}
      </p>

      {/* Metadata: one compact line */}
      <div className="mt-1 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
        <span>{surah.revelationType === "makkah" ? "Meccan" : "Medinan"}</span>
        <span className="text-border/60">·</span>
        <span>{surah.versesCount} verses</span>
        <span className="text-border/60">·</span>
        <button
          onClick={() => audio.play(`${surah.id}:1`, surah.id)}
          className="inline-flex items-center gap-1 text-primary/70 hover:text-primary transition-fast"
          aria-label="Play surah"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
          Play
        </button>
      </div>

      {/* Ornamental divider */}
      <div className="surah-divider mt-3">
        <span className="px-3 text-muted-foreground/30 text-xs select-none">✦</span>
      </div>

      {/* Bismillah with ornament frame */}
      {showBismillah && surah.id !== 1 && surah.id !== 9 && (
        <div className="bismillah-ornament mt-2">
          <p
            lang="ar"
            dir="rtl"
            className="arabic-display text-xl text-foreground/80 sm:text-2xl"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}
    </div>
  );
}
