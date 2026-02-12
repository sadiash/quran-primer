"use client";

import type { Verse, Surah } from "@/core/types";
import { toEasternArabicNumeral } from "@/lib/arabic-utils";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { IconButton } from "@/presentation/components/ui";
import { Play, Pause } from "lucide-react";
import { TafsirPanel } from "./tafsir-panel";
import { HadithPanel } from "./hadith-panel";

interface StudyViewProps {
  verse: Verse;
  surah: Surah;
}

export function StudyView({ verse, surah }: StudyViewProps) {
  const audio = useAudioPlayer();
  const isPlaying =
    audio.currentVerseKey === verse.verseKey && audio.isPlaying;

  const handlePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play(verse.verseKey, surah.id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Verse Display */}
      <div className="rounded-xl glass p-6 shadow-soft-md">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {surah.nameSimple} — Verse {verse.verseNumber}
          </p>
          <IconButton
            label={isPlaying ? "Pause" : "Play"}
            variant="ghost"
            size="md"
            onClick={handlePlay}
          >
            {isPlaying ? <Pause /> : <Play />}
          </IconButton>
        </div>

        <div
          className="text-center text-3xl leading-[2.4]"
          dir="rtl"
          lang="ar"
          style={{ fontFamily: "var(--font-arabic-reading)" }}
        >
          {verse.textUthmani}
          <span className="mx-2 text-xl text-primary/70">
            ﴿{toEasternArabicNumeral(verse.verseNumber)}﴾
          </span>
        </div>
      </div>

      {/* Panels */}
      <div className="grid gap-6 md:grid-cols-2">
        <TafsirPanel verseKey={verse.verseKey} />
        <HadithPanel defaultQuery={`${surah.nameSimple} ${verse.verseKey}`} />
      </div>
    </div>
  );
}
