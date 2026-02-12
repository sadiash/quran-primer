"use client";

import Link from "next/link";
import { Badge } from "@/presentation/components/ui";
import type { Surah, ReadingProgress } from "@/core/types";

interface SurahCardProps {
  surah: Surah;
  progress?: ReadingProgress;
}

export function SurahCard({ surah, progress }: SurahCardProps) {
  const progressPercent = progress
    ? Math.round((progress.completedVerses / progress.totalVerses) * 100)
    : 0;

  return (
    <Link
      href={`/surahs/${surah.id}`}
      className="glass rounded-xl p-4 transition-smooth hover:shadow-glow hover:glow-primary block group"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
          {surah.id}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-right text-lg font-semibold leading-relaxed"
            style={{ fontFamily: "var(--font-arabic-display)" }}
            dir="rtl"
            lang="ar"
          >
            {surah.nameArabic}
          </p>
          <p className="text-sm font-medium">{surah.nameSimple}</p>
          <p className="text-xs text-muted-foreground">{surah.nameTranslation}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] capitalize">
          {surah.revelationType}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {surah.versesCount} verses
        </span>
      </div>

      {progress && (
        <div
          className="mt-2 h-1 rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Reading progress: ${progressPercent}%`}
        >
          <div
            className="h-full rounded-full bg-primary transition-smooth"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </Link>
  );
}
