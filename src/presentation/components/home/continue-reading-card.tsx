"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useProgress } from "@/presentation/hooks/use-progress";
import { getSurahName } from "@/lib/surah-names";

export function ContinueReadingCard() {
  const { getLatestProgress } = useProgress();
  const latest = getLatestProgress();

  if (!latest) {
    return (
      <Link
        href="/surahs/1"
        className="glass rounded-xl p-6 transition-smooth hover:shadow-glow block"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Start Reading</h3>
            <p className="text-sm text-muted-foreground">
              Begin with Al-Fatihah
            </p>
          </div>
        </div>
      </Link>
    );
  }

  const progressPercent = Math.round(
    (latest.completedVerses / latest.totalVerses) * 100,
  );
  const surahName = getSurahName(latest.surahId);

  return (
    <Link
      href={`/surahs/${latest.surahId}#verse-${latest.lastVerseKey}`}
      className="glass rounded-xl p-6 transition-smooth hover:shadow-glow block"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Continue Reading</h3>
          <p className="text-sm text-muted-foreground">{surahName}</p>
          <div className="mt-2 h-1.5 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-smooth"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
