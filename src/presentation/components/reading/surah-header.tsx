"use client";

import { MapPin, FileText, Play } from "lucide-react";
import type { Surah } from "@/core/types";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";

interface SurahHeaderProps {
  surah: Surah;
}

export function SurahHeader({ surah }: SurahHeaderProps) {
  const audio = useAudioPlayer();

  return (
    <div className="text-center">
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
