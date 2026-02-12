/** Dexie (IndexedDB) client-side database schema */

import Dexie, { type EntityTable } from "dexie";

export interface BookmarkRecord {
  id: string;
  verseKey: string;
  surahId: number;
  note: string;
  createdAt: Date;
}

export interface NoteRecord {
  id: string;
  verseKey: string;
  surahId: number;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressRecord {
  surahId: number;
  lastVerseKey: string;
  lastVerseNumber: number;
  completedVerses: number;
  totalVerses: number;
  updatedAt: Date;
}

export interface PreferencesRecord {
  id: string;
  theme: string;
  arabicFont: string;
  arabicFontSize: string;
  translationFontSize: string;
  showTranslation: boolean;
  defaultTranslationId: number;
  defaultReciterId: number;
  updatedAt: Date;
}

export class AppDatabase extends Dexie {
  bookmarks!: EntityTable<BookmarkRecord, "id">;
  notes!: EntityTable<NoteRecord, "id">;
  progress!: EntityTable<ProgressRecord, "surahId">;
  preferences!: EntityTable<PreferencesRecord, "id">;

  constructor() {
    super("quran-primer");

    this.version(1).stores({
      bookmarks: "id, verseKey, surahId, createdAt",
      notes: "id, verseKey, surahId, *tags, updatedAt",
      progress: "surahId, updatedAt",
      preferences: "id",
    });
  }
}

export const db = new AppDatabase();
