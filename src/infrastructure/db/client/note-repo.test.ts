import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./schema";
import { DexieNoteRepository } from "./note-repo";
import type { Note } from "@/core/types";

describe("DexieNoteRepository", () => {
  const repo = new DexieNoteRepository();

  beforeEach(async () => {
    await db.notes.clear();
  });

  function makeNote(overrides: Partial<Note> = {}): Note {
    return {
      id: "note-1",
      verseKey: "2:255",
      surahId: 2,
      content: "Ayat al-Kursi reflection",
      tags: ["reflection"],
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
      ...overrides,
    };
  }

  it("save() and getAll()", async () => {
    await repo.save(makeNote());
    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.content).toBe("Ayat al-Kursi reflection");
  });

  it("getBySurah() filters by surahId", async () => {
    await repo.save(makeNote({ id: "n1", surahId: 2 }));
    await repo.save(makeNote({ id: "n2", surahId: 3, verseKey: "3:1" }));

    const s2 = await repo.getBySurah(2);
    expect(s2).toHaveLength(1);
  });

  it("getByVerseKey() returns notes for a verse", async () => {
    await repo.save(makeNote({ id: "n1" }));
    await repo.save(makeNote({ id: "n2", verseKey: "2:255" }));

    const notes = await repo.getByVerseKey("2:255");
    expect(notes).toHaveLength(2);
  });

  it("getByTag() finds notes by tag", async () => {
    await repo.save(makeNote({ id: "n1", tags: ["reflection", "favorites"] }));
    await repo.save(makeNote({ id: "n2", tags: ["study"] }));

    const reflections = await repo.getByTag("reflection");
    expect(reflections).toHaveLength(1);
    expect(reflections[0]?.id).toBe("n1");
  });

  it("save() upserts existing notes", async () => {
    await repo.save(makeNote({ content: "first" }));
    await repo.save(makeNote({ content: "edited" }));

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.content).toBe("edited");
  });

  it("remove() deletes a note", async () => {
    await repo.save(makeNote());
    await repo.remove("note-1");
    const all = await repo.getAll();
    expect(all).toHaveLength(0);
  });
});
