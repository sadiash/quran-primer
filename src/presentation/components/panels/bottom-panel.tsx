"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
} from "lucide-react";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";

export function BottomPanel() {
  const audio = useAudioPlayer();

  if (!audio.isActive) return null;

  const progress = audio.duration > 0
    ? (audio.currentTime / audio.duration) * 100
    : 0;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full items-center gap-3 border-t border-border bg-card/80 px-4 backdrop-blur-sm">
      {/* Verse info */}
      <div className="min-w-0 flex-shrink-0">
        <p className="text-xs font-medium text-foreground truncate">
          Verse {audio.currentVerseKey}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Surah {audio.currentSurahId}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={audio.previous}
          className="rounded-md p-1.5 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
          aria-label="Previous verse"
        >
          <SkipBack className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => audio.isPlaying ? audio.pause() : audio.resume()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-fast hover:bg-primary/90"
          aria-label={audio.isPlaying ? "Pause" : "Play"}
        >
          {audio.isPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 ml-0.5" />
          )}
        </button>

        <button
          onClick={audio.next}
          className="rounded-md p-1.5 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
          aria-label="Next verse"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={audio.stop}
          className="rounded-md p-1.5 text-muted-foreground transition-fast hover:bg-surface-hover hover:text-foreground"
          aria-label="Stop"
        >
          <Square className="h-3 w-3" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex flex-1 items-center gap-2">
        <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">
          {formatTime(audio.currentTime)}
        </span>
        <div
          className="relative h-1 flex-1 cursor-pointer rounded-full bg-muted"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audio.seek(pct * audio.duration);
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground tabular-nums w-8">
          {formatTime(audio.duration)}
        </span>
      </div>

      {/* Volume icon (placeholder) */}
      <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}
