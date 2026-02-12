"use client";

import type { Surah } from "@/core/types";
import { SurahCard } from "./surah-card";

interface SurahGridProps {
  surahs: Surah[];
}

export function SurahGrid({ surahs }: SurahGridProps) {
  if (surahs.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No surahs match your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {surahs.map((surah) => (
        <SurahCard key={surah.id} surah={surah} />
      ))}
    </div>
  );
}
