"use client";

import Link from "next/link";
import { BookmarkSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { getSurahColor } from "@/lib/surah-colors";
import { cn } from "@/lib/utils";

export function BookmarksList() {
  const { bookmarks, removeBookmark } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <BookmarkSimpleIcon weight="duotone" className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No bookmarks yet. Tap the bookmark icon on any verse to save it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bm) => {
        const [surahId] = bm.verseKey.split(":");
        const surahColor = getSurahColor(Number(surahId));
        return (
          <div
            key={bm.id}
            className={cn(
              "group flex items-center gap-3 border border-border bg-background p-3",
              "transition-colors hover:bg-[#fafafa]",
            )}
            style={{ borderLeft: `3px solid ${surahColor.accent}` }}
          >
            <Link
              href={`/surahs/${surahId}`}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-foreground">
                Verse {bm.verseKey}
              </p>
              {bm.note && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {bm.note}
                </p>
              )}
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {bm.createdAt.toLocaleDateString()}
              </p>
            </Link>
            <button
              onClick={() => removeBookmark(bm.id)}
              className="shrink-0 p-1.5 text-muted-foreground opacity-0 transition-colors group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove bookmark"
            >
              <TrashIcon weight="bold" className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
