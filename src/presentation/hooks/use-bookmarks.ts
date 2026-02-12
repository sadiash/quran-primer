"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/infrastructure/db/client";
import type { Bookmark } from "@/core/types";

export function useBookmarks(surahId?: number) {
  const bookmarks = useLiveQuery(
    () =>
      surahId !== undefined
        ? db.bookmarks.where("surahId").equals(surahId).toArray()
        : db.bookmarks.orderBy("createdAt").reverse().toArray(),
    [surahId],
    [] as Bookmark[],
  );

  function isBookmarked(verseKey: string): boolean {
    return bookmarks.some((b) => b.verseKey === verseKey);
  }

  async function toggleBookmark(
    verseKey: string,
    surahId: number,
  ): Promise<boolean> {
    const existing = await db.bookmarks
      .where("verseKey")
      .equals(verseKey)
      .first();

    if (existing) {
      await db.bookmarks.delete(existing.id);
      return false; // removed
    }

    await db.bookmarks.put({
      id: crypto.randomUUID(),
      verseKey,
      surahId,
      note: "",
      createdAt: new Date(),
    });
    return true; // added
  }

  async function removeBookmark(id: string): Promise<void> {
    await db.bookmarks.delete(id);
  }

  return { bookmarks, isBookmarked, toggleBookmark, removeBookmark };
}
