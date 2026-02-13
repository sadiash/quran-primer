/** Cross-scripture reference types — maps to Scripturas.info API */

export type ScriptureSource = "bible" | "torah" | "quran";

export interface ScriptureVerse {
  source: ScriptureSource;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  verseKey?: string; // Quran-style key e.g. "2:247" (only for Quran verses)
}

export interface CrossScriptureCluster {
  id: string;
  summary: string;
  verses: ScriptureVerse[];
  similarity: number;
}

export interface CrossReference {
  id: string;
  quranVerseKey: string;
  scriptureRef: string; // e.g. "Genesis 1:1" or "Matthew 5:3"
  scriptureText: string;
  source: ScriptureSource;
  clusterSummary: string;
  createdAt: Date;
}
