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
      verseKeys: ["2:255"],
      surahIds: [2],
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

  it("getBySurah() filters by surahIds", async () => {
    await repo.save(makeNote({ id: "n1", surahIds: [2] }));
    await repo.save(makeNote({ id: "n2", surahIds: [3], verseKeys: ["3:1"] }));

    const s2 = await repo.getBySurah(2);
    expect(s2).toHaveLength(1);
  });

  it("getByVerseKey() returns notes for a verse", async () => {
    await repo.save(makeNote({ id: "n1" }));
    await repo.save(makeNote({ id: "n2", verseKeys: ["2:255"] }));

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

  it("getForVerse() returns notes by verseKey or surahId", async () => {
    await repo.save(makeNote({ id: "n1", verseKeys: ["2:255"], surahIds: [] }));
    await repo.save(makeNote({ id: "n2", verseKeys: [], surahIds: [2] }));
    await repo.save(makeNote({ id: "n3", verseKeys: ["3:1"], surahIds: [3] }));

    const notes = await repo.getForVerse("2:255", 2);
    expect(notes).toHaveLength(2);
    expect(notes.map((n) => n.id).sort()).toEqual(["n1", "n2"]);
  });

  it("getById() returns a single note", async () => {
    await repo.save(makeNote({ id: "n1" }));
    const note = await repo.getById("n1");
    expect(note?.id).toBe("n1");

    const missing = await repo.getById("nonexistent");
    expect(missing).toBeNull();
  });
});
