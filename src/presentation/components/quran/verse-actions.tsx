"use client";

import { Bookmark, StickyNote, Play, Copy } from "lucide-react";
import { IconButton } from "@/presentation/components/ui";

interface VerseActionsProps {
  verseKey: string;
}

export function VerseActions({ verseKey }: VerseActionsProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verseKey);
    } catch {
      // clipboard API unavailable
    }
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg glass px-1 py-0.5 shadow-soft-sm opacity-0 transition-fast group-hover:opacity-100">
      <IconButton label="Bookmark verse" variant="ghost" size="sm">
        <Bookmark />
      </IconButton>
      <IconButton label="Add note" variant="ghost" size="sm">
        <StickyNote />
      </IconButton>
      <IconButton label="Play verse" variant="ghost" size="sm">
        <Play />
      </IconButton>
      <IconButton label="Copy verse key" variant="ghost" size="sm" onClick={handleCopy}>
        <Copy />
      </IconButton>
    </div>
  );
}
