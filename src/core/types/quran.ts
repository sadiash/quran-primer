/** Core Quran domain types — zero framework imports */

export type RevelationType = "makkah" | "madinah";

export interface Verse {
  id: number;
  verseKey: string; // "1:1", "2:255"
  verseNumber: number;
  textUthmani: string;
  textSimple: string;
}

export interface Surah {
  id: number;
  nameArabic: string;
  nameSimple: string;
  nameComplex: string;
  nameTranslation: string;
  revelationType: RevelationType;
  versesCount: number;
}

export interface SurahWithVerses extends Surah {
  verses: Verse[];
}

export interface Translation {
  id: number;
  resourceId: number;
  resourceName: string;
  languageCode: string;
  verseKey: string;
  text: string;
}

export interface TranslationResource {
  id: number;
  name: string;
  authorName: string;
  languageCode: string;
  slug: string;
}

export interface Tafsir {
  id: number;
  resourceId: number;
  resourceName: string;
  languageCode: string;
  verseKey: string;
  text: string; // may contain HTML
}

export interface TafsirResource {
  id: number;
  name: string;
  authorName: string;
  languageCode: string;
  slug: string;
}

export interface AudioRecitation {
  verseKey: string;
  url: string;
}

export interface Reciter {
  id: number;
  name: string;
  style: string | null;
  translatedName: string;
}

export interface Hadith {
  id: number;
  collection: string;
  bookNumber: string;
  hadithNumber: string;
  text: string; // may contain HTML
  grade: string | null;
  narratedBy: string | null;
}

export interface HadithCollection {
  id: string;
  name: string;
  hadithCount: number;
}
