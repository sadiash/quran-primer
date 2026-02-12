"use client";

import Link from "next/link";
import { Badge } from "@/presentation/components/ui";
import type { Surah } from "@/core/types";

interface SurahCardProps {
  surah: Surah;
}

export function SurahCard({ surah }: SurahCardProps) {
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
    </Link>
  );
}
