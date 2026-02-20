"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "@/infrastructure/db/client";
import type { Note, LinkedResource } from "@/core/types";

export type NoteSortOption = "newest" | "oldest" | "updated" | "alphabetical";

interface UseNotesOptions {
  surahId?: number;
  verseKey?: string;
  tag?: string;
  /** Union query: notes linked to any verse in this surah OR surah-level notes */
  forSurahReading?: number;
}

function sortNotes(notes: Note[], sort: NoteSortOption): Note[] {
  const pinned = notes.filter((n) => n.pinned);
  const unpinned = notes.filter((n) => !n.pinned);

  const sorter = (a: Note, b: Note) => {
    switch (sort) {
      case "newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "updated":
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      case "alphabetical": {
        const aLabel = a.title || a.content;
        const bLabel = b.title || b.content;
        return aLabel.localeCompare(bLabel);
      }
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime();
    }
  };

  pinned.sort(sorter);
  unpinned.sort(sorter);

  return [...pinned, ...unpinned];
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
    title?: string;
    pinned?: boolean;
    linkedResources?: LinkedResource[];
    id?: string;
  }): Promise<void> {
    const now = new Date();
    if (params.id) {
      await db.notes.update(params.id, {
        title: params.title,
        verseKeys: params.verseKeys,
        surahIds: params.surahIds,
        content: params.content,
        contentJson: params.contentJson,
        tags: params.tags,
        ...(params.pinned !== undefined ? { pinned: params.pinned } : {}),
        ...(params.linkedResources !== undefined ? { linkedResources: params.linkedResources } : {}),
        updatedAt: now,
      });
    } else {
      await db.notes.put({
        id: crypto.randomUUID(),
        title: params.title,
        verseKeys: params.verseKeys,
        surahIds: params.surahIds,
        content: params.content,
        contentJson: params.contentJson,
        tags: params.tags,
        pinned: params.pinned ?? false,
        linkedResources: params.linkedResources,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async function removeNote(id: string): Promise<void> {
    await db.notes.delete(id);
  }

  /** Toggle the pinned state of a note */
  async function togglePin(id: string): Promise<void> {
    const note = await db.notes.get(id);
    if (!note) return;
    await db.notes.update(id, {
      pinned: !note.pinned,
      updatedAt: new Date(),
    });
  }

  /** Restore a previously deleted note (for undo) */
  async function restoreNote(note: Note): Promise<void> {
    await db.notes.put(note);
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

  /** Add a linked resource (hadith/tafsir) to an existing note */
  async function addResourceToNote(
    noteId: string,
    resource: LinkedResource,
  ): Promise<void> {
    const note = await db.notes.get(noteId);
    if (!note) return;
    const existing = note.linkedResources ?? [];
    // Deduplicate by type + label
    if (existing.some((r) => r.type === resource.type && r.label === resource.label)) return;
    await db.notes.update(noteId, {
      linkedResources: [...existing, resource],
      updatedAt: new Date(),
    });
  }

  /** Get all notes (for export) */
  async function getAllNotes(): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  }

  /** Import notes from an array, skipping duplicates by ID */
  async function importNotes(
    incoming: Note[],
  ): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;
    for (const note of incoming) {
      const existing = await db.notes.get(note.id);
      if (existing) {
        skipped++;
      } else {
        await db.notes.put({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        });
        imported++;
      }
    }
    return { imported, skipped };
  }

  // Collect all unique tags across all notes for suggestions
  const allNotes = useLiveQuery(
    () => db.notes.toArray(),
    [],
    [] as Note[],
  );

  const suggestedTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const n of allNotes) {
      for (const t of n.tags) {
        tagSet.add(t);
      }
    }
    return [...tagSet].sort();
  }, [allNotes]);

  return {
    notes,
    saveNote,
    removeNote,
    togglePin,
    restoreNote,
    addVerseToNote,
    addResourceToNote,
    getAllNotes,
    importNotes,
    sortNotes,
    suggestedTags,
  };
}
