"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useBookmarks } from "@/presentation/hooks/use-bookmarks";
import { useToast } from "@/presentation/components/ui/toast";
import { IconButton, Skeleton, EmptyState } from "@/presentation/components/ui";
import { getSurahName } from "@/lib/surah-names";

export function BookmarksList() {
  const { bookmarks, removeBookmark } = useBookmarks();
  const { toast } = useToast();

  if (bookmarks === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        title="No bookmarks yet."
        description="Tap the bookmark icon on any verse to save it."
      />
    );
  }

  const handleRemove = async (id: string) => {
    await removeBookmark(id);
    toast("Bookmark removed");
  };

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => {
        const [surahId, verseNum] = bookmark.verseKey.split(":");
        const surahName = getSurahName(Number(surahId));

        return (
          <div
            key={bookmark.id}
            className="glass flex items-center justify-between rounded-xl p-4 transition-smooth hover:shadow-glow"
          >
            <Link
              href={`/surahs/${surahId}#verse-${bookmark.verseKey}`}
              className="flex-1"
            >
              <p className="font-medium">
                {surahName} — Verse {verseNum}
              </p>
              <p className="text-xs text-muted-foreground">
                {bookmark.createdAt.toLocaleDateString()}
              </p>
            </Link>
            <IconButton
              label="Remove bookmark"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(bookmark.id)}
            >
              <Trash2 />
            </IconButton>
          </div>
        );
      })}
    </div>
  );
}
