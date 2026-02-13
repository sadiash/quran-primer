"use client";

import type { Verse, Surah } from "@/core/types";
import { BookOpen } from "lucide-react";

interface StudyViewProps {
  verse: Verse;
  surah: Surah;
}

export function StudyView({ verse, surah }: StudyViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">
          {surah.nameSimple} — Verse {verse.verseNumber}
        </h1>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <p
          lang="ar"
          dir="rtl"
          className="arabic-reading text-3xl leading-loose text-foreground"
        >
          {verse.textUthmani}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Verse Key
        </p>
        <p className="font-mono text-sm text-foreground">{verse.verseKey}</p>
      </div>
    </div>
  );
}
