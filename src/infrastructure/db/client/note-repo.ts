/** Dexie-backed note repository */

import type { NoteRepository } from "@/core/ports";
import type { Note } from "@/core/types";
import { db } from "./schema";

export class DexieNoteRepository implements NoteRepository {
  async getAll(): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  }

  async getBySurah(surahId: number): Promise<Note[]> {
    return db.notes.where("surahId").equals(surahId).toArray();
  }

  async getByVerseKey(verseKey: string): Promise<Note[]> {
    return db.notes.where("verseKey").equals(verseKey).toArray();
  }

  async getByTag(tag: string): Promise<Note[]> {
    return db.notes.where("tags").equals(tag).toArray();
  }

  async save(note: Note): Promise<void> {
    await db.notes.put(note);
  }

  async remove(id: string): Promise<void> {
    await db.notes.delete(id);
  }
}
