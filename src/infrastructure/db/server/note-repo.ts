/** Drizzle-backed note repository — scoped by userId */

import { eq, and, desc, arrayContains } from "drizzle-orm";
import type { NoteRepository } from "@/core/ports";
import type { Note } from "@/core/types";
import type { DrizzleDb } from "./connection";
import { notes } from "./schema";

export class DrizzleNoteRepository implements NoteRepository {
  constructor(
    private readonly db: DrizzleDb,
    private readonly userId: string,
  ) {}

  async getAll(): Promise<Note[]> {
    const rows = await this.db
      .select()
      .from(notes)
      .where(eq(notes.userId, this.userId))
      .orderBy(desc(notes.updatedAt));

    return rows.map(toNote);
  }

  async getBySurah(surahId: number): Promise<Note[]> {
    const rows = await this.db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, this.userId), eq(notes.surahId, surahId)));

    return rows.map(toNote);
  }

  async getByVerseKey(verseKey: string): Promise<Note[]> {
    const rows = await this.db
      .select()
      .from(notes)
      .where(
        and(eq(notes.userId, this.userId), eq(notes.verseKey, verseKey)),
      );

    return rows.map(toNote);
  }

  async getByTag(tag: string): Promise<Note[]> {
    const rows = await this.db
      .select()
      .from(notes)
      .where(
        and(eq(notes.userId, this.userId), arrayContains(notes.tags, [tag])),
      );

    return rows.map(toNote);
  }

  async save(note: Note): Promise<void> {
    await this.db
      .insert(notes)
      .values({
        id: note.id,
        userId: this.userId,
        verseKey: note.verseKey,
        surahId: note.surahId,
        content: note.content,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })
      .onConflictDoUpdate({
        target: notes.id,
        set: {
          content: note.content,
          tags: note.tags,
          updatedAt: note.updatedAt,
        },
      });
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(notes).where(eq(notes.id, id));
  }
}

function toNote(row: typeof notes.$inferSelect): Note {
  return {
    id: row.id,
    verseKey: row.verseKey,
    surahId: row.surahId,
    content: row.content,
    tags: row.tags,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
