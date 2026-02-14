/** Dexie-backed note repository */

import type { NoteRepository } from "@/core/ports";
import type { Note } from "@/core/types";
import { db } from "./schema";

export class DexieNoteRepository implements NoteRepository {
  async getAll(): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  }

  async getBySurah(surahId: number): Promise<Note[]> {
    return db.notes.where("surahIds").equals(surahId).toArray();
  }

  async getByVerseKey(verseKey: string): Promise<Note[]> {
    return db.notes.where("verseKeys").equals(verseKey).toArray();
  }

  async getByTag(tag: string): Promise<Note[]> {
    return db.notes.where("tags").equals(tag).toArray();
  }

  async getForVerse(verseKey: string, surahId: number): Promise<Note[]> {
    // Two parallel multiEntry queries + JS dedupe (Dexie .or() unreliable across multiEntry)
    const [byVerse, bySurah] = await Promise.all([
      db.notes.where("verseKeys").equals(verseKey).toArray(),
      db.notes.where("surahIds").equals(surahId).toArray(),
    ]);
    const seen = new Set<string>();
    const result: Note[] = [];
    for (const n of [...byVerse, ...bySurah]) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        result.push(n);
      }
    }
    return result;
  }

  async getById(id: string): Promise<Note | null> {
    return (await db.notes.get(id)) ?? null;
  }

  async save(note: Note): Promise<void> {
    await db.notes.put(note);
  }

  async remove(id: string): Promise<void> {
    await db.notes.delete(id);
  }
}
