import { describe, it, expect } from "vitest";
import { QuranLocalAdapter } from "./quran-local-adapter";

describe("QuranLocalAdapter", () => {
  const adapter = new QuranLocalAdapter();

  it("getAllSurahs() returns 114 surahs", async () => {
    const surahs = await adapter.getAllSurahs();
    expect(surahs).toHaveLength(114);
    expect(surahs[0]?.nameSimple).toBe("Al-Fatihah");
    expect(surahs[113]?.nameSimple).toBe("An-Nas");
  });

  it("getSurah() returns a surah with verses", async () => {
    const surah = await adapter.getSurah(1);
    expect(surah).not.toBeNull();
    expect(surah!.nameSimple).toBe("Al-Fatihah");
    expect(surah!.verses).toHaveLength(7);
    expect(surah!.verses[0]?.verseKey).toBe("1:1");
  });

  it("getSurah() returns null for invalid id", async () => {
    const surah = await adapter.getSurah(999);
    expect(surah).toBeNull();
  });

  it("getVerse() returns a specific verse", async () => {
    const verse = await adapter.getVerse("1:1");
    expect(verse).not.toBeNull();
    expect(verse!.textUthmani).toContain("بِسْمِ");
  });

  it("getVerse() returns null for invalid key", async () => {
    const verse = await adapter.getVerse("999:1");
    expect(verse).toBeNull();
  });

  it("getVerses() returns all verses for a surah", async () => {
    const verses = await adapter.getVerses(1);
    expect(verses).toHaveLength(7);
  });

  it("getVerses() returns empty array for invalid surah", async () => {
    const verses = await adapter.getVerses(999);
    expect(verses).toEqual([]);
  });

  it("search() finds verses containing Arabic text", async () => {
    const results = await adapter.search("بِسْمِ");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.textUthmani).toContain("بِسْمِ");
  });

  it("search() returns empty for no match", async () => {
    const results = await adapter.search("xyznotfound123");
    expect(results).toEqual([]);
  });

  it("search() returns empty for empty query", async () => {
    const results = await adapter.search("");
    expect(results).toEqual([]);
  });

  it("caches surah data on repeated reads", async () => {
    // First read
    const first = await adapter.getSurah(2);
    // Second read should come from cache
    const second = await adapter.getSurah(2);
    expect(first).toBe(second); // same reference = cached
  });
});
