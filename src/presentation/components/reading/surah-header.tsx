"use client";

import Link from "next/link";
import { MapPin, FileText, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { Surah } from "@/core/types";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { cn } from "@/lib/utils";

interface SurahHeaderProps {
  surah: Surah;
}

export function SurahHeader({ surah }: SurahHeaderProps) {
  const audio = useAudioPlayer();
  const hasPrev = surah.id > 1;
  const hasNext = surah.id < 114;

  return (
    <div className="text-center">
      {/* Prev / Next surah navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Link
          href={hasPrev ? `/surah/${surah.id - 1}` : "#"}
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-fast",
            hasPrev
              ? "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              : "pointer-events-none opacity-30 text-muted-foreground",
          )}
          aria-label="Previous surah"
          aria-disabled={!hasPrev}
          tabIndex={hasPrev ? 0 : -1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Link>
        <span className="text-xs font-medium text-muted-foreground">
          {surah.id} / 114
        </span>
        <Link
          href={hasNext ? `/surah/${surah.id + 1}` : "#"}
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-fast",
            hasNext
              ? "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              : "pointer-events-none opacity-30 text-muted-foreground",
          )}
          aria-label="Next surah"
          aria-disabled={!hasNext}
          tabIndex={hasNext ? 0 : -1}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Arabic name */}
      <h1
        lang="ar"
        dir="rtl"
        className="arabic-display text-4xl text-foreground sm:text-5xl"
      >
        {surah.nameArabic}
      </h1>

      {/* English name */}
      <h2 className="mt-2 text-lg font-semibold text-foreground">
        {surah.nameSimple}
      </h2>
      <p className="text-sm text-muted-foreground">
        {surah.nameTranslation}
      </p>

      {/* Metadata */}
      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {surah.revelationType === "makkah" ? "Meccan" : "Medinan"}
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {surah.versesCount} verses
        </span>
      </div>

      {/* Play button */}
      <button
        onClick={() => audio.play(`${surah.id}:1`, surah.id)}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition-fast hover:bg-primary/20"
      >
        <Play className="h-3.5 w-3.5" />
        Play Surah
      </button>

      {/* Bismillah */}
      {surah.id !== 1 && surah.id !== 9 && (
        <p
          lang="ar"
          dir="rtl"
          className="arabic-display mt-8 text-2xl text-foreground/80 sm:text-3xl"
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      )}
    </div>
  );
}
