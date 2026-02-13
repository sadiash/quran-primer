import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./schema";
import { DexieCrossReferenceRepository } from "./cross-reference-repo";
import type { CrossReference } from "@/core/types";

describe("DexieCrossReferenceRepository", () => {
  const repo = new DexieCrossReferenceRepository();

  beforeEach(async () => {
    await db.crossReferences.clear();
  });

  function makeRef(overrides: Partial<CrossReference> = {}): CrossReference {
    return {
      id: "cr-1",
      quranVerseKey: "2:247",
      scriptureRef: "Genesis 1:26",
      scriptureText: "Then God said, Let us make mankind in our image.",
      source: "bible",
      clusterSummary: "Creation of mankind",
      createdAt: new Date("2025-01-01"),
      ...overrides,
    };
  }

  it("save() and getAll()", async () => {
    await repo.save(makeRef());
    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.quranVerseKey).toBe("2:247");
  });

  it("getByVerseKey() filters by quranVerseKey", async () => {
    await repo.save(makeRef({ id: "cr-1", quranVerseKey: "2:247" }));
    await repo.save(makeRef({ id: "cr-2", quranVerseKey: "3:45" }));

    const refs = await repo.getByVerseKey("2:247");
    expect(refs).toHaveLength(1);
    expect(refs[0]?.id).toBe("cr-1");
  });

  it("getBySource() filters by source", async () => {
    await repo.save(makeRef({ id: "cr-1", source: "bible" }));
    await repo.save(makeRef({ id: "cr-2", source: "torah" }));

    const bibleRefs = await repo.getBySource("bible");
    expect(bibleRefs).toHaveLength(1);
    expect(bibleRefs[0]?.source).toBe("bible");
  });

  it("saveMany() bulk inserts", async () => {
    await repo.saveMany([
      makeRef({ id: "cr-1" }),
      makeRef({ id: "cr-2", quranVerseKey: "3:45" }),
    ]);

    const all = await repo.getAll();
    expect(all).toHaveLength(2);
  });

  it("save() upserts existing records", async () => {
    await repo.save(makeRef({ clusterSummary: "first" }));
    await repo.save(makeRef({ clusterSummary: "updated" }));

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.clusterSummary).toBe("updated");
  });

  it("remove() deletes a reference", async () => {
    await repo.save(makeRef());
    await repo.remove("cr-1");
    const all = await repo.getAll();
    expect(all).toHaveLength(0);
  });

  it("removeByVerseKey() deletes all references for a verse", async () => {
    await repo.save(makeRef({ id: "cr-1", quranVerseKey: "2:247" }));
    await repo.save(
      makeRef({
        id: "cr-2",
        quranVerseKey: "2:247",
        scriptureRef: "Psalms 8:4",
      }),
    );
    await repo.save(makeRef({ id: "cr-3", quranVerseKey: "3:45" }));

    await repo.removeByVerseKey("2:247");

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]?.quranVerseKey).toBe("3:45");
  });
});
