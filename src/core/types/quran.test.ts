import { describe, it, expect } from "vitest";
import type {
  Verse,
  Surah,
  SurahWithVerses,
  Translation,
  Tafsir,
  AudioRecitation,
  Reciter,
  Hadith,
} from "@/core/types";

describe("Quran domain types", () => {
  it("Verse matches bundled data shape", () => {
    const verse: Verse = {
      id: 1,
      verseKey: "1:1",
      verseNumber: 1,
      textUthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
      textSimple: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    };
    expect(verse.verseKey).toBe("1:1");
    expect(verse.id).toBe(1);
  });

  it("Surah matches bundled metadata shape", () => {
    const surah: Surah = {
      id: 1,
      nameArabic: "الفاتحة",
      nameSimple: "Al-Fatihah",
      nameComplex: "Al-Fātiĥah",
      nameTranslation: "The Opener",
      revelationType: "makkah",
      versesCount: 7,
    };
    expect(surah.revelationType).toBe("makkah");
  });

  it("SurahWithVerses extends Surah with verses array", () => {
    const surah: SurahWithVerses = {
      id: 1,
      nameArabic: "الفاتحة",
      nameSimple: "Al-Fatihah",
      nameComplex: "Al-Fātiĥah",
      nameTranslation: "The Opener",
      revelationType: "makkah",
      versesCount: 7,
      verses: [
        {
          id: 1,
          verseKey: "1:1",
          verseNumber: 1,
          textUthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
          textSimple: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        },
      ],
    };
    expect(surah.verses).toHaveLength(1);
    expect(surah.versesCount).toBe(7);
  });

  it("Translation has required fields", () => {
    const t: Translation = {
      id: 1,
      resourceId: 131,
      resourceName: "Sahih International",
      languageCode: "en",
      verseKey: "1:1",
      text: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    };
    expect(t.resourceId).toBe(131);
  });

  it("Tafsir has required fields", () => {
    const t: Tafsir = {
      id: 1,
      resourceId: 1,
      resourceName: "Ibn Kathir",
      languageCode: "en",
      verseKey: "1:1",
      text: "<p>Tafsir content</p>",
    };
    expect(t.text).toContain("<p>");
  });

  it("AudioRecitation has url and verseKey", () => {
    const a: AudioRecitation = {
      verseKey: "1:1",
      url: "https://audio.qurancdn.com/1/1.mp3",
    };
    expect(a.url).toContain(".mp3");
  });

  it("Reciter has required fields", () => {
    const r: Reciter = {
      id: 1,
      name: "Mishari Rashid al-Afasy",
      style: "Murattal",
      translatedName: "Mishari Rashid al-Afasy",
    };
    expect(r.style).toBe("Murattal");
  });

  it("Hadith has required fields", () => {
    const h: Hadith = {
      id: 1,
      collection: "bukhari",
      bookNumber: "1",
      hadithNumber: "1",
      text: "Actions are judged by intentions...",
      grade: "Sahih",
      narratedBy: "Umar ibn Al-Khattab",
      reference: "https://sunnah.com/bukhari:1",
      inBookReference: "Book 1, Hadith 1",
    };
    expect(h.grade).toBe("Sahih");
  });
});
