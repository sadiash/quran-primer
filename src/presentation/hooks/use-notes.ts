"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/infrastructure/db/client";
import type { Note } from "@/core/types";

interface UseNotesOptions {
  surahId?: number;
  verseKey?: string;
  tag?: string;
}

export function useNotes(opts?: UseNotesOptions) {
  const { surahId, verseKey, tag } = opts ?? {};

  const notes = useLiveQuery(
    () => {
      if (verseKey) return db.notes.where("verseKey").equals(verseKey).toArray();
      if (surahId !== undefined)
        return db.notes.where("surahId").equals(surahId).toArray();
      if (tag) return db.notes.where("tags").equals(tag).toArray();
      return db.notes.orderBy("updatedAt").reverse().toArray();
    },
    [surahId, verseKey, tag],
    [] as Note[],
  );

  async function saveNote(params: {
    verseKey: string;
    surahId: number;
    content: string;
    contentJson?: string;
    tags: string[];
    id?: string;
  }): Promise<void> {
    const now = new Date();
    if (params.id) {
      await db.notes.update(params.id, {
        content: params.content,
        contentJson: params.contentJson,
        tags: params.tags,
        updatedAt: now,
      });
    } else {
      await db.notes.put({
        id: crypto.randomUUID(),
        verseKey: params.verseKey,
        surahId: params.surahId,
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

  return { notes, saveNote, removeNote };
}
