export interface MockVerse {
  id: number;
  verseKey: string;
  verseNumber: number;
  textUthmani: string;
  textSimple: string;
}

export interface MockSurah {
  id: number;
  nameArabic: string;
  nameSimple: string;
  nameComplex: string;
  nameTranslation: string;
  revelationType: "makkah" | "madinah";
  versesCount: number;
}

export interface MockSurahWithVerses extends MockSurah {
  verses: MockVerse[];
}

export function createMockVerse(overrides: Partial<MockVerse> = {}): MockVerse {
  return {
    id: 1,
    verseKey: "1:1",
    verseNumber: 1,
    textUthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    textSimple: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    ...overrides,
  };
}

export function createMockSurah(overrides: Partial<MockSurah> = {}): MockSurah {
  return {
    id: 1,
    nameArabic: "الفاتحة",
    nameSimple: "Al-Fatihah",
    nameComplex: "Al-Fātiĥah",
    nameTranslation: "The Opener",
    revelationType: "makkah",
    versesCount: 7,
    ...overrides,
  };
}

export function createMockSurahWithVerses(
  overrides: Partial<MockSurahWithVerses> = {}
): MockSurahWithVerses {
  const surah = createMockSurah(overrides);
  return {
    ...surah,
    verses: overrides.verses ?? [
      createMockVerse({ id: 1, verseKey: `${surah.id}:1`, verseNumber: 1 }),
      createMockVerse({ id: 2, verseKey: `${surah.id}:2`, verseNumber: 2 }),
      createMockVerse({ id: 3, verseKey: `${surah.id}:3`, verseNumber: 3 }),
    ],
  };
}

export function createMockBookmark(
  overrides: Partial<{
    id: string;
    verseKey: string;
    surahId: number;
    createdAt: Date;
    note: string;
  }> = {}
) {
  return {
    id: "bm-1",
    verseKey: "1:1",
    surahId: 1,
    createdAt: new Date("2025-01-01"),
    note: "",
    ...overrides,
  };
}

export function createMockNote(
  overrides: Partial<{
    id: string;
    verseKey: string;
    surahId: number;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  return {
    id: "note-1",
    verseKey: "1:1",
    surahId: 1,
    content: "Test note content",
    tags: ["reflection"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}
