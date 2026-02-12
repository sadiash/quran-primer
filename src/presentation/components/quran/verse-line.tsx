"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { Verse, Translation } from "@/core/types";
import { toEasternArabicNumeral } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { VerseActions } from "./verse-actions";

interface VerseLineProps {
  verse: Verse;
  surahId: number;
  translation?: Translation;
  observerRef: RefObject<IntersectionObserver | null>;
  isBookmarked?: boolean;
  hasNote?: boolean;
  onNoteClick?: () => void;
}

export function VerseLine({
  verse,
  surahId,
  translation,
  observerRef,
  isBookmarked,
  hasNote,
  onNoteClick,
}: VerseLineProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const { currentVerseKey } = useAudioPlayer();
  const isCurrentlyPlaying = currentVerseKey === verse.verseKey;

  useEffect(() => {
    const el = elRef.current;
    const observer = observerRef.current;
    if (!el || !observer) return;

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [observerRef]);

  return (
    <div
      ref={elRef}
      data-verse-key={verse.verseKey}
      id={`verse-${verse.verseKey}`}
      className={cn(
        "group rounded-lg py-4 transition-smooth",
        isCurrentlyPlaying && "bg-primary/5 shadow-glow",
        isBookmarked && "border-l-2 border-primary/50 pl-3",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex-1 text-right text-2xl leading-[2.4]"
          dir="rtl"
          lang="ar"
          style={{ fontFamily: "var(--font-arabic-reading)" }}
        >
          <span className="inline rounded-sm transition-fast group-hover:bg-primary/5">
            {verse.textUthmani}
          </span>
          <span className="mx-2 text-lg text-primary/70">
            ﴿{toEasternArabicNumeral(verse.verseNumber)}﴾
          </span>
        </div>

        <VerseActions
          verseKey={verse.verseKey}
          surahId={surahId}
          isBookmarked={isBookmarked}
          hasNote={hasNote}
          onNoteClick={onNoteClick}
        />
      </div>

      {translation && (
        <p
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
          dir="ltr"
        >
          {translation.text}
        </p>
      )}
    </div>
  );
}
