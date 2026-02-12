import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./schema";
import { DexieProgressRepository } from "./progress-repo";
import type { ReadingProgress } from "@/core/types";

describe("DexieProgressRepository", () => {
  const repo = new DexieProgressRepository();

  beforeEach(async () => {
    await db.progress.clear();
  });

  function makeProgress(overrides: Partial<ReadingProgress> = {}): ReadingProgress {
    return {
      surahId: 1,
      lastVerseKey: "1:3",
      lastVerseNumber: 3,
      completedVerses: 3,
      totalVerses: 7,
      updatedAt: new Date("2025-01-01"),
      ...overrides,
    };
  }

  it("save() and getAll()", async () => {
    await repo.save(makeProgress());
    const all = await repo.getAll();
    expect(all).toHaveLength(1);
  });

  it("getBySurah() returns progress or null", async () => {
    await repo.save(makeProgress({ surahId: 1 }));

    const found = await repo.getBySurah(1);
    expect(found).not.toBeNull();
    expect(found!.completedVerses).toBe(3);

    const notFound = await repo.getBySurah(99);
    expect(notFound).toBeNull();
  });

  it("save() upserts by surahId", async () => {
    await repo.save(makeProgress({ completedVerses: 3 }));
    await repo.save(makeProgress({ completedVerses: 5, lastVerseKey: "1:5", lastVerseNumber: 5 }));

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.completedVerses).toBe(5);
  });
});
