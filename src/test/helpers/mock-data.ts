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

export function createMockTranslation(
  overrides: Partial<{
    id: number;
    resourceId: number;
    resourceName: string;
    languageCode: string;
    verseKey: string;
    text: string;
  }> = {}
) {
  return {
    id: 1,
    resourceId: 20,
    resourceName: "Sahih International",
    languageCode: "en",
    verseKey: "1:1",
    text: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    ...overrides,
  };
}

export function createMockTranslationResource(
  overrides: Partial<{
    id: number;
    name: string;
    authorName: string;
    languageCode: string;
    slug: string;
  }> = {}
) {
  return {
    id: 20,
    name: "Sahih International",
    authorName: "Sahih International",
    languageCode: "en",
    slug: "sahih-international",
    ...overrides,
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

export function createMockAudioRecitation(
  overrides: Partial<{ verseKey: string; url: string }> = {}
) {
  return {
    verseKey: "1:1",
    url: "https://audio.example.com/1_1.mp3",
    ...overrides,
  };
}

export function createMockReciter(
  overrides: Partial<{
    id: number;
    name: string;
    style: string | null;
    translatedName: string;
  }> = {}
) {
  return {
    id: 7,
    name: "Mishari Rashid al-Afasy",
    style: null,
    translatedName: "Mishari Rashid al-Afasy",
    ...overrides,
  };
}

export function createMockTafsir(
  overrides: Partial<{
    id: number;
    resourceId: number;
    resourceName: string;
    languageCode: string;
    verseKey: string;
    text: string;
  }> = {}
) {
  return {
    id: 1,
    resourceId: 169,
    resourceName: "Ibn Kathir",
    languageCode: "en",
    verseKey: "1:1",
    text: "<p>In the name of Allah, the Most Gracious, the Most Merciful.</p>",
    ...overrides,
  };
}

export function createMockTafsirResource(
  overrides: Partial<{
    id: number;
    name: string;
    authorName: string;
    languageCode: string;
    slug: string;
  }> = {}
) {
  return {
    id: 169,
    name: "Ibn Kathir",
    authorName: "Ibn Kathir",
    languageCode: "en",
    slug: "ibn-kathir-en",
    ...overrides,
  };
}

export function createMockHadith(
  overrides: Partial<{
    id: number;
    collection: string;
    bookNumber: string;
    hadithNumber: string;
    text: string;
    grade: string | null;
    narratedBy: string | null;
    reference: string | null;
    inBookReference: string | null;
  }> = {}
) {
  return {
    id: 1,
    collection: "Sahih Bukhari",
    bookNumber: "1",
    hadithNumber: "1",
    text: "<p>Actions are judged by intentions.</p>",
    grade: "Sahih",
    narratedBy: "Umar ibn al-Khattab",
    reference: "https://sunnah.com/bukhari:1",
    inBookReference: "Book 1, Hadith 1",
    ...overrides,
  };
}

export function createMockNote(
  overrides: Partial<{
    id: string;
    verseKeys: string[];
    surahIds: number[];
    content: string;
    contentJson: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  return {
    id: "note-1",
    verseKeys: ["1:1"],
    surahIds: [1],
    content: "Test note content",
    tags: ["reflection"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function createMockCrossReference(
  overrides: Partial<{
    id: string;
    quranVerseKey: string;
    scriptureRef: string;
    scriptureText: string;
    source: "bible" | "torah" | "quran";
    clusterSummary: string;
    createdAt: Date;
  }> = {}
) {
  return {
    id: "cr-1",
    quranVerseKey: "2:247",
    scriptureRef: "Genesis 1:26",
    scriptureText: "Then God said, Let us make mankind in our image.",
    source: "bible" as const,
    clusterSummary: "Creation of mankind",
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function createMockCrossScriptureCluster(
  overrides: Partial<{
    id: string;
    summary: string;
    similarity: number;
    verses: Array<{
      source: "bible" | "torah" | "quran";
      book: string;
      chapter: number;
      verse: number;
      text: string;
      verseKey?: string;
    }>;
  }> = {}
) {
  return {
    id: "cluster-1",
    summary: "Creation of mankind and divine sovereignty",
    similarity: 0.85,
    verses: overrides.verses ?? [
      {
        source: "quran" as const,
        book: "Quran",
        chapter: 2,
        verse: 247,
        text: "Their prophet said to them...",
        verseKey: "2:247",
      },
      {
        source: "bible" as const,
        book: "Genesis",
        chapter: 1,
        verse: 26,
        text: "Then God said, Let us make mankind...",
      },
    ],
    ...overrides,
  };
}

export function createMockGraphNode(
  overrides: Partial<{
    id: string;
    nodeType: "verse" | "note" | "bookmark" | "theme" | "surah";
    label: string;
    verseKey: string;
    surahId: number;
    metadata: Record<string, unknown>;
    createdAt: Date;
  }> = {}
) {
  return {
    id: "node-1",
    nodeType: "verse" as const,
    label: "2:247",
    verseKey: "2:247",
    surahId: 2,
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

export function createMockGraphEdge(
  overrides: Partial<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: "references" | "thematic" | "user-linked" | "same-surah";
    weight: number;
    createdAt: Date;
  }> = {}
) {
  return {
    id: "edge-1",
    sourceNodeId: "node-1",
    targetNodeId: "node-2",
    edgeType: "references" as const,
    weight: 1,
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}
