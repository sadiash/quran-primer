"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { SkipBack, Play, Pause, SkipForward, Square } from "lucide-react";
import { IconButton } from "@/presentation/components/ui";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function AudioDockContent() {
  const {
    currentVerseKey,
    isPlaying,
    duration,
    currentTime,
    pause,
    resume,
    stop,
    next,
    previous,
  } = useAudioPlayer();

  if (!currentVerseKey) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="animate-slide-in-bottom glass shadow-soft-md border-t border-border/50">
      {/* Progress bar */}
      <div className="h-1 w-full bg-muted/30">
        <div
          className="h-full bg-primary transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-2 px-2 sm:gap-4 sm:px-4 py-2">
        {/* Left: Verse info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            Verse {currentVerseKey}
          </p>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-1">
          <IconButton label="Previous verse" variant="ghost" size="sm" onClick={previous}>
            <SkipBack />
          </IconButton>
          <IconButton
            label={isPlaying ? "Pause" : "Play"}
            variant="default"
            size="md"
            onClick={() => (isPlaying ? pause() : resume())}
          >
            {isPlaying ? <Pause /> : <Play />}
          </IconButton>
          <IconButton label="Next verse" variant="ghost" size="sm" onClick={next}>
            <SkipForward />
          </IconButton>
          <IconButton label="Stop" variant="ghost" size="sm" onClick={stop}>
            <Square />
          </IconButton>
        </div>

        {/* Right: Time */}
        <div className="min-w-0 flex-1 text-right">
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

const noop = () => () => {};

function usePortalSlot(id: string) {
  return useSyncExternalStore(
    noop,
    () => document.getElementById(id),
    () => null,
  );
}

export function AudioDock() {
  const slot = usePortalSlot("audio-dock-slot");

  if (!slot) return null;

  return createPortal(<AudioDockContent />, slot);
}
