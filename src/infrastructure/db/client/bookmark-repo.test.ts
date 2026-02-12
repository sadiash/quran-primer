import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./schema";
import { DexieBookmarkRepository } from "./bookmark-repo";
import type { Bookmark } from "@/core/types";

describe("DexieBookmarkRepository", () => {
  const repo = new DexieBookmarkRepository();

  beforeEach(async () => {
    await db.bookmarks.clear();
  });

  function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
    return {
      id: "bm-1",
      verseKey: "1:1",
      surahId: 1,
      note: "",
      createdAt: new Date("2025-01-01"),
      ...overrides,
    };
  }

  it("save() and getAll()", async () => {
    await repo.save(makeBookmark());
    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.verseKey).toBe("1:1");
  });

  it("getBySurah() filters by surahId", async () => {
    await repo.save(makeBookmark({ id: "bm-1", surahId: 1 }));
    await repo.save(makeBookmark({ id: "bm-2", surahId: 2, verseKey: "2:1" }));

    const s1 = await repo.getBySurah(1);
    expect(s1).toHaveLength(1);

    const s2 = await repo.getBySurah(2);
    expect(s2).toHaveLength(1);
  });

  it("getByVerseKey() returns bookmark or null", async () => {
    await repo.save(makeBookmark());

    const found = await repo.getByVerseKey("1:1");
    expect(found).not.toBeNull();
    expect(found!.id).toBe("bm-1");

    const notFound = await repo.getByVerseKey("99:99");
    expect(notFound).toBeNull();
  });

  it("save() upserts existing bookmarks", async () => {
    await repo.save(makeBookmark({ note: "first" }));
    await repo.save(makeBookmark({ note: "updated" }));

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.note).toBe("updated");
  });

  it("remove() deletes a bookmark", async () => {
    await repo.save(makeBookmark());
    await repo.remove("bm-1");
    const all = await repo.getAll();
    expect(all).toHaveLength(0);
  });
});
