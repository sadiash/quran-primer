/** Dexie-backed bookmark repository */

import type { BookmarkRepository } from "@/core/ports";
import type { Bookmark } from "@/core/types";
import { db } from "./schema";

export class DexieBookmarkRepository implements BookmarkRepository {
  async getAll(): Promise<Bookmark[]> {
    const records = await db.bookmarks.orderBy("createdAt").reverse().toArray();
    return records;
  }

  async getBySurah(surahId: number): Promise<Bookmark[]> {
    return db.bookmarks.where("surahId").equals(surahId).toArray();
  }

  async getByVerseKey(verseKey: string): Promise<Bookmark | null> {
    const record = await db.bookmarks.where("verseKey").equals(verseKey).first();
    return record ?? null;
  }

  async save(bookmark: Bookmark): Promise<void> {
    await db.bookmarks.put(bookmark);
  }

  async remove(id: string): Promise<void> {
    await db.bookmarks.delete(id);
  }
}
