"use client";

import { Eye, BookOpen, Bookmark, FileText, Play } from "lucide-react";
import { useWorkspace } from "@/presentation/providers";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { useNotes } from "@/presentation/hooks/use-notes";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";

export function ContextPreviewPanel() {
  const { state, addPanel } = useWorkspace();
  const verseKey = state.focusedVerseKey;
  const surahId = verseKey ? Number(verseKey.split(":")[0]) : undefined;
  const verseNumber = verseKey ? Number(verseKey.split(":")[1]) : undefined;
  const { isBookmarked, toggleBookmark } = useBookmarks(surahId);
  const { notes } = useNotes({ verseKey: verseKey ?? undefined });
  const audio = useAudioPlayer();

  if (!verseKey || !surahId || !verseNumber) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-4">
        <Eye className="h-8 w-8 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No verse selected</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Click on a verse for a quick overview
          </p>
        </div>
      </div>
    );
  }

  const bookmarked = isBookmarked(verseKey);

  return (
    <div className="space-y-4">
      {/* Verse reference */}
      <div className="text-center">
        <p className="text-lg font-bold text-foreground font-mono">{verseKey}</p>
        <p className="text-xs text-muted-foreground">
          Surah {surahId}, Verse {verseNumber}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-surface p-3 text-center">
          <p className="text-lg font-bold text-foreground">{notes.length}</p>
          <p className="text-[10px] text-muted-foreground">Notes</p>
        </div>
        <div className="rounded-lg bg-surface p-3 text-center">
          <p className="text-lg font-bold text-foreground">{bookmarked ? "Yes" : "No"}</p>
          <p className="text-[10px] text-muted-foreground">Bookmarked</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Quick Actions
        </p>

        <button
          onClick={() => {
            if (audio.isPlaying && audio.currentVerseKey === verseKey) {
              audio.pause();
            } else {
              audio.play(verseKey, surahId);
            }
          }}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-foreground transition-fast hover:bg-surface-hover"
        >
          <Play className="h-3.5 w-3.5 text-primary" />
          {audio.isPlaying && audio.currentVerseKey === verseKey ? "Pause audio" : "Play audio"}
        </button>

        <button
          onClick={() => toggleBookmark(verseKey, surahId)}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-foreground transition-fast hover:bg-surface-hover"
        >
          <Bookmark className="h-3.5 w-3.5 text-primary" />
          {bookmarked ? "Remove bookmark" : "Add bookmark"}
        </button>

        <button
          onClick={() => addPanel("tafsir")}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-foreground transition-fast hover:bg-surface-hover"
        >
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          Open Tafsir
        </button>

        <button
          onClick={() => addPanel("notes")}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-foreground transition-fast hover:bg-surface-hover"
        >
          <FileText className="h-3.5 w-3.5 text-primary" />
          Open Notes
        </button>
      </div>
    </div>
  );
}
