"use client";

import { useCallback, useMemo } from "react";
import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon, XIcon } from "@phosphor-icons/react";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { getSurahName } from "@/lib/surah-names";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const RECITER_NAMES: Record<number, string> = {
  7: "Mishari Rashid al-Afasy",
  1: "Abdul Basit",
  2: "Abdul Rahman Al-Sudais",
  3: "Abu Bakr al-Shatri",
  5: "Hani Ar-Rifai",
  6: "Mahmoud Khalil al-Husary",
  10: "Saad Al-Ghamdi",
  12: "Maher Al Muaiqly",
};

export function AudioDock() {
  const audio = useAudioPlayer();

  const verseLabel = useMemo(() => {
    if (!audio.currentVerseKey || !audio.currentSurahId) return "";
    const surahName = getSurahName(audio.currentSurahId);
    return `${surahName} ${audio.currentVerseKey}`;
  }, [audio.currentVerseKey, audio.currentSurahId]);

  const reciterName = RECITER_NAMES[audio.reciterId] ?? `Reciter ${audio.reciterId}`;

  const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (audio.duration <= 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.seek(ratio * audio.duration);
    },
    [audio],
  );

  const handlePlayPause = useCallback(() => {
    if (audio.isPlaying) audio.pause();
    else audio.resume();
  }, [audio]);

  if (!audio.isActive) return null;

  return (
    <div className="audio-dock-floating">
      {/* Progress bar — clickable */}
      <div
        className="group mx-3 mt-2 h-1 cursor-pointer rounded-full bg-muted/40 transition-all hover:h-1.5"
        onClick={handleSeek}
      >
        <div
          className="h-full rounded-full bg-primary/70 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex h-10 items-center gap-2 px-3 md:gap-3">
        {/* Verse label + reciter */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium text-foreground leading-tight">
            {verseLabel}
          </p>
          <p className="truncate text-[9px] text-muted-foreground/60 leading-tight">
            {reciterName}
          </p>
        </div>

        {/* Time display */}
        <span className="hidden text-[9px] font-mono text-muted-foreground/50 sm:block tabular-nums">
          {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={audio.previous}
            className="rounded-full p-1.5 text-muted-foreground/60 transition-all hover:text-foreground"
            aria-label="Previous verse"
          >
            <SkipBackIcon weight="bold" className="h-3 w-3" />
          </button>

          <button
            onClick={handlePlayPause}
            className={cn(
              "rounded-full p-2 transition-all",
              "bg-primary/10 text-primary hover:bg-primary/15",
            )}
            aria-label={audio.isPlaying ? "Pause" : "Play"}
          >
            {audio.isPlaying ? (
              <PauseIcon weight="fill" className="h-3.5 w-3.5" />
            ) : (
              <PlayIcon weight="fill" className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            onClick={audio.next}
            className="rounded-full p-1.5 text-muted-foreground/60 transition-all hover:text-foreground"
            aria-label="Next verse"
          >
            <SkipForwardIcon weight="bold" className="h-3 w-3" />
          </button>
        </div>

        {/* Stop / close button */}
        <button
          onClick={audio.stop}
          className="rounded-full p-1 text-muted-foreground/40 transition-all hover:text-foreground"
          aria-label="Stop audio"
        >
          <XIcon weight="bold" className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
