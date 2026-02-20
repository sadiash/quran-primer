"use client";

import { useCallback, useMemo } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  X,
} from "lucide-react";
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
    <div className="audio-dock shrink-0 border-t border-border bg-card/95 backdrop-blur-sm">
      {/* Progress bar — clickable */}
      <div
        className="group h-1 w-full cursor-pointer bg-muted/50 transition-all hover:h-1.5"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex h-11 items-center gap-2 px-3 md:gap-3 md:px-4">
        {/* Verse label + reciter */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground leading-tight">
            {verseLabel}
          </p>
          <p className="truncate text-[10px] text-muted-foreground/70 leading-tight">
            {reciterName}
          </p>
        </div>

        {/* Time display */}
        <span className="hidden text-[10px] font-mono text-muted-foreground/60 sm:block">
          {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={audio.previous}
            className="rounded-md p-1.5 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
            aria-label="Previous verse"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handlePlayPause}
            className={cn(
              "rounded-full p-1.5 transition-fast",
              "bg-primary/10 text-primary hover:bg-primary/20",
            )}
            aria-label={audio.isPlaying ? "Pause" : "Play"}
          >
            {audio.isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={audio.next}
            className="rounded-md p-1.5 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
            aria-label="Next verse"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Stop / close button */}
        <button
          onClick={audio.stop}
          className="rounded-md p-1.5 text-muted-foreground/60 transition-fast hover:bg-surface-hover hover:text-foreground"
          aria-label="Stop audio"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
