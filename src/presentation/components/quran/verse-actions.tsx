"use client";

import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  StickyNote,
  Play,
  Pause,
  Copy,
  BookOpen,
} from "lucide-react";
import { IconButton } from "@/presentation/components/ui";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { useToast } from "@/presentation/components/ui/toast";

interface VerseActionsProps {
  verseKey: string;
  surahId: number;
  isBookmarked?: boolean;
  hasNote?: boolean;
  onNoteClick?: () => void;
}

export function VerseActions({
  verseKey,
  surahId,
  isBookmarked,
  hasNote,
  onNoteClick,
}: VerseActionsProps) {
  const audio = useAudioPlayer();
  const { toggleBookmark } = useBookmarks(surahId);
  const { toast } = useToast();
  const isThisVersePlaying =
    audio.currentVerseKey === verseKey && audio.isPlaying;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verseKey);
    } catch {
      // clipboard API unavailable
    }
  };

  const handlePlay = () => {
    if (isThisVersePlaying) {
      audio.pause();
    } else {
      audio.play(verseKey, surahId);
    }
  };

  const handleBookmark = async () => {
    const added = await toggleBookmark(verseKey, surahId);
    toast(added ? "Bookmark added" : "Bookmark removed");
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg glass px-1 py-0.5 shadow-soft-sm transition-fast md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
      <IconButton
        label={isBookmarked ? "Remove bookmark" : "Bookmark verse"}
        variant="ghost"
        size="sm"
        onClick={handleBookmark}
      >
        {isBookmarked ? (
          <BookmarkCheck className="text-primary" />
        ) : (
          <Bookmark />
        )}
      </IconButton>
      <IconButton
        label={hasNote ? "Edit note" : "Add note"}
        variant="ghost"
        size="sm"
        onClick={onNoteClick}
      >
        <StickyNote className={hasNote ? "text-primary" : undefined} />
      </IconButton>
      <IconButton
        label={isThisVersePlaying ? "Pause verse" : "Play verse"}
        variant="ghost"
        size="sm"
        onClick={handlePlay}
      >
        {isThisVersePlaying ? <Pause /> : <Play />}
      </IconButton>
      <Link
        href={`/study/${verseKey}`}
        aria-label="Study verse"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:bg-surface-hover hover:text-foreground [&>svg]:h-3.5 [&>svg]:w-3.5"
      >
        <BookOpen />
      </Link>
      <IconButton
        label="Copy verse key"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
      >
        <Copy />
      </IconButton>
    </div>
  );
}
