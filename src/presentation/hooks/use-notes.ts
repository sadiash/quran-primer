"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/infrastructure/db/client";
import type { Note } from "@/core/types";

interface UseNotesOptions {
  surahId?: number;
  verseKey?: string;
  tag?: string;
  /** Union query: notes linked to any verse in this surah OR surah-level notes */
  forSurahReading?: number;
}

export function useNotes(opts?: UseNotesOptions) {
  const { surahId, verseKey, tag, forSurahReading } = opts ?? {};

  const notes = useLiveQuery(
    () => {
      if (verseKey)
        return db.notes.where("verseKeys").equals(verseKey).toArray();
      if (surahId !== undefined)
        return db.notes.where("surahIds").equals(surahId).toArray();
      if (tag) return db.notes.where("tags").equals(tag).toArray();
      if (forSurahReading !== undefined) {
        // Two parallel queries: verse-level (prefix match) + surah-level, deduped
        const prefix = `${forSurahReading}:`;
        return Promise.all([
          db.notes
            .where("verseKeys")
            .startsWith(prefix)
            .toArray(),
          db.notes
            .where("surahIds")
            .equals(forSurahReading)
            .toArray(),
        ]).then(([byVerse, bySurah]) => {
          const seen = new Set<string>();
          const result: Note[] = [];
          for (const n of [...byVerse, ...bySurah]) {
            if (!seen.has(n.id)) {
              seen.add(n.id);
              result.push(n);
            }
          }
          return result;
        });
      }
      return db.notes.orderBy("updatedAt").reverse().toArray();
    },
    [surahId, verseKey, tag, forSurahReading],
    [] as Note[],
  );

  async function saveNote(params: {
    verseKeys: string[];
    surahIds: number[];
    content: string;
    contentJson?: string;
    tags: string[];
    id?: string;
  }): Promise<void> {
    const now = new Date();
    if (params.id) {
      await db.notes.update(params.id, {
        verseKeys: params.verseKeys,
        surahIds: params.surahIds,
        content: params.content,
        contentJson: params.contentJson,
        tags: params.tags,
        updatedAt: now,
      });
    } else {
      await db.notes.put({
        id: crypto.randomUUID(),
        verseKeys: params.verseKeys,
        surahIds: params.surahIds,
        content: params.content,
        contentJson: params.contentJson,
        tags: params.tags,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async function removeNote(id: string): Promise<void> {
    await db.notes.delete(id);
  }

  /** Add a verse reference to an existing note */
  async function addVerseToNote(
    noteId: string,
    verseKey: string,
  ): Promise<void> {
    const note = await db.notes.get(noteId);
    if (!note) return;
    if (note.verseKeys.includes(verseKey)) return;
    await db.notes.update(noteId, {
      verseKeys: [...note.verseKeys, verseKey],
      updatedAt: new Date(),
    });
  }

  return { notes, saveNote, removeNote, addVerseToNote };
}
