/** Drizzle-backed note repository — scoped by userId */

import { eq, and, desc, arrayContains, arrayOverlaps } from "drizzle-orm";
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
      .where(
        and(
          eq(notes.userId, this.userId),
          arrayContains(notes.surahIds, [surahId]),
        ),
      );

    return rows.map(toNote);
  }

  async getByVerseKey(verseKey: string): Promise<Note[]> {
    const rows = await this.db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, this.userId),
          arrayContains(notes.verseKeys, [verseKey]),
        ),
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

  async getForVerse(verseKey: string, surahId: number): Promise<Note[]> {
    const rows = await this.db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, this.userId),
          arrayOverlaps(notes.verseKeys, [verseKey]),
        ),
      );

    const bySurah = await this.db
      .select()
      .from(notes)
      .where(
        and(
          eq(notes.userId, this.userId),
          arrayContains(notes.surahIds, [surahId]),
        ),
      );

    const seen = new Set<string>();
    const result: Note[] = [];
    for (const row of [...rows, ...bySurah]) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        result.push(toNote(row));
      }
    }
    return result;
  }

  async getById(id: string): Promise<Note | null> {
    const rows = await this.db
      .select()
      .from(notes)
      .where(eq(notes.id, id))
      .limit(1);

    const row = rows[0];
    return row ? toNote(row) : null;
  }

  async save(note: Note): Promise<void> {
    await this.db
      .insert(notes)
      .values({
        id: note.id,
        userId: this.userId,
        verseKeys: note.verseKeys,
        surahIds: note.surahIds,
        content: note.content,
        contentJson: note.contentJson,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })
      .onConflictDoUpdate({
        target: notes.id,
        set: {
          verseKeys: note.verseKeys,
          surahIds: note.surahIds,
          content: note.content,
          contentJson: note.contentJson,
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
    verseKeys: row.verseKeys,
    surahIds: row.surahIds,
    content: row.content,
    contentJson: row.contentJson ?? undefined,
    tags: row.tags,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
