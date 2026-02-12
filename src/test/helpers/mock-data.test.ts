import { describe, it, expect } from "vitest";
import {
  createMockVerse,
  createMockSurah,
  createMockSurahWithVerses,
  createMockBookmark,
  createMockNote,
} from "./mock-data";

describe("mock data factories", () => {
  it("creates a default verse", () => {
    const verse = createMockVerse();
    expect(verse.verseKey).toBe("1:1");
    expect(verse.textUthmani).toBeTruthy();
    expect(verse.textSimple).toBeTruthy();
  });

  it("creates a verse with overrides", () => {
    const verse = createMockVerse({ id: 42, verseKey: "2:255" });
    expect(verse.id).toBe(42);
    expect(verse.verseKey).toBe("2:255");
  });

  it("creates a default surah", () => {
    const surah = createMockSurah();
    expect(surah.id).toBe(1);
    expect(surah.nameSimple).toBe("Al-Fatihah");
    expect(surah.revelationType).toBe("makkah");
  });

  it("creates a surah with verses", () => {
    const surah = createMockSurahWithVerses();
    expect(surah.verses).toHaveLength(3);
    expect(surah.verses[0]?.verseKey).toBe("1:1");
  });

  it("creates a surah with custom verse count", () => {
    const surah = createMockSurahWithVerses({
      id: 2,
      nameSimple: "Al-Baqarah",
      verses: [createMockVerse({ verseKey: "2:255" })],
    });
    expect(surah.verses).toHaveLength(1);
    expect(surah.nameSimple).toBe("Al-Baqarah");
  });

  it("creates a default bookmark", () => {
    const bookmark = createMockBookmark();
    expect(bookmark.verseKey).toBe("1:1");
    expect(bookmark.id).toBe("bm-1");
  });

  it("creates a default note", () => {
    const note = createMockNote();
    expect(note.verseKey).toBe("1:1");
    expect(note.tags).toContain("reflection");
  });
});
