/** Drizzle-backed bookmark repository — scoped by userId */

import { eq, and, desc } from "drizzle-orm";
import type { BookmarkRepository } from "@/core/ports";
import type { Bookmark } from "@/core/types";
import type { DrizzleDb } from "./connection";
import { bookmarks } from "./schema";

export class DrizzleBookmarkRepository implements BookmarkRepository {
  constructor(
    private readonly db: DrizzleDb,
    private readonly userId: string,
  ) {}

  async getAll(): Promise<Bookmark[]> {
    const rows = await this.db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, this.userId))
      .orderBy(desc(bookmarks.createdAt));

    return rows.map(toBookmark);
  }

  async getBySurah(surahId: number): Promise<Bookmark[]> {
    const rows = await this.db
      .select()
      .from(bookmarks)
      .where(
        and(eq(bookmarks.userId, this.userId), eq(bookmarks.surahId, surahId)),
      );

    return rows.map(toBookmark);
  }

  async getByVerseKey(verseKey: string): Promise<Bookmark | null> {
    const rows = await this.db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, this.userId),
          eq(bookmarks.verseKey, verseKey),
        ),
      )
      .limit(1);

    return rows[0] ? toBookmark(rows[0]) : null;
  }

  async save(bookmark: Bookmark): Promise<void> {
    await this.db
      .insert(bookmarks)
      .values({
        id: bookmark.id,
        userId: this.userId,
        verseKey: bookmark.verseKey,
        surahId: bookmark.surahId,
        note: bookmark.note,
        createdAt: bookmark.createdAt,
      })
      .onConflictDoUpdate({
        target: bookmarks.id,
        set: {
          verseKey: bookmark.verseKey,
          surahId: bookmark.surahId,
          note: bookmark.note,
        },
      });
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(bookmarks).where(eq(bookmarks.id, id));
  }
}

function toBookmark(row: typeof bookmarks.$inferSelect): Bookmark {
  return {
    id: row.id,
    verseKey: row.verseKey,
    surahId: row.surahId,
    note: row.note,
    createdAt: row.createdAt,
  };
}
