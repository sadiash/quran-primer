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
  contentJson?: string;
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
  activeTranslationIds?: number[];
  translationLayout?: string;
  showArabic?: boolean;
  defaultReciterId: number;
  activeTafsirIds?: number[];
  activeHadithCollections?: string[];
  onboardingComplete?: boolean;
  updatedAt: Date;
}

export interface CrossReferenceRecord {
  id: string;
  quranVerseKey: string;
  scriptureRef: string;
  scriptureText: string;
  source: string;
  clusterSummary: string;
  createdAt: Date;
}

export interface GraphNodeRecord {
  id: string;
  nodeType: string;
  label: string;
  verseKey?: string;
  surahId?: number;
  metadata?: string; // JSON-serialized
  createdAt: Date;
}

export interface GraphEdgeRecord {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: string;
  weight?: number;
  createdAt: Date;
}

export class AppDatabase extends Dexie {
  bookmarks!: EntityTable<BookmarkRecord, "id">;
  notes!: EntityTable<NoteRecord, "id">;
  progress!: EntityTable<ProgressRecord, "surahId">;
  preferences!: EntityTable<PreferencesRecord, "id">;
  crossReferences!: EntityTable<CrossReferenceRecord, "id">;
  graphNodes!: EntityTable<GraphNodeRecord, "id">;
  graphEdges!: EntityTable<GraphEdgeRecord, "id">;

  constructor() {
    super("quran-primer");

    this.version(1).stores({
      bookmarks: "id, verseKey, surahId, createdAt",
      notes: "id, verseKey, surahId, *tags, updatedAt",
      progress: "surahId, updatedAt",
      preferences: "id",
    });

    this.version(2).stores({
      bookmarks: "id, verseKey, surahId, createdAt",
      notes: "id, verseKey, surahId, *tags, updatedAt",
      progress: "surahId, updatedAt",
      preferences: "id",
      crossReferences: "id, quranVerseKey, source, createdAt",
      graphNodes: "id, nodeType, verseKey, surahId, createdAt",
      graphEdges: "id, sourceNodeId, targetNodeId, edgeType, createdAt",
    });

    // v3: add activeTafsirIds, activeHadithCollections, onboardingComplete to preferences
    this.version(3).stores({
      bookmarks: "id, verseKey, surahId, createdAt",
      notes: "id, verseKey, surahId, *tags, updatedAt",
      progress: "surahId, updatedAt",
      preferences: "id",
      crossReferences: "id, quranVerseKey, source, createdAt",
      graphNodes: "id, nodeType, verseKey, surahId, createdAt",
      graphEdges: "id, sourceNodeId, targetNodeId, edgeType, createdAt",
    });
  }
}

export const db = new AppDatabase();
