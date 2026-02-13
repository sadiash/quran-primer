import { describe, it, expect } from "vitest";
import type {
  Bookmark,
  Note,
  ReadingProgress,
  UserPreferences,
} from "@/core/types";

describe("Study domain types", () => {
  it("Bookmark has required fields", () => {
    const bm: Bookmark = {
      id: "bm-1",
      verseKey: "2:255",
      surahId: 2,
      note: "Ayat al-Kursi",
      createdAt: new Date("2025-01-01"),
    };
    expect(bm.surahId).toBe(2);
    expect(bm.createdAt).toBeInstanceOf(Date);
  });

  it("Note has tags and timestamps", () => {
    const note: Note = {
      id: "note-1",
      verseKey: "2:255",
      surahId: 2,
      content: "Reflection on Ayat al-Kursi",
      tags: ["reflection", "favorites"],
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-02"),
    };
    expect(note.tags).toHaveLength(2);
    expect(note.updatedAt.getTime()).toBeGreaterThan(
      note.createdAt.getTime(),
    );
  });

  it("ReadingProgress tracks per-surah progress", () => {
    const progress: ReadingProgress = {
      surahId: 2,
      lastVerseKey: "2:100",
      lastVerseNumber: 100,
      completedVerses: 100,
      totalVerses: 286,
      updatedAt: new Date(),
    };
    expect(progress.completedVerses).toBeLessThan(progress.totalVerses);
  });

  it("UserPreferences has sensible defaults shape", () => {
    const prefs: UserPreferences = {
      id: "default",
      theme: "system",
      themeName: "library",
      arabicFont: "uthmani",
      arabicFontSize: "lg",
      translationFontSize: "md",
      showTranslation: true,
      defaultTranslationId: 131,
      activeTranslationIds: [131],
      translationLayout: "stacked",
      showArabic: true,
      defaultReciterId: 7,
      updatedAt: new Date(),
    };
    expect(prefs.theme).toBe("system");
    expect(prefs.showTranslation).toBe(true);
  });
});
