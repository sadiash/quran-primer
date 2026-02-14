import type {
  Bookmark,
  Note,
  ReadingProgress,
  UserPreferences,
} from "@/core/types";

/** Persistence for bookmarks */
export interface BookmarkRepository {
  getAll(): Promise<Bookmark[]>;
  getBySurah(surahId: number): Promise<Bookmark[]>;
  getByVerseKey(verseKey: string): Promise<Bookmark | null>;
  save(bookmark: Bookmark): Promise<void>;
  remove(id: string): Promise<void>;
}

/** Persistence for notes */
export interface NoteRepository {
  getAll(): Promise<Note[]>;
  getBySurah(surahId: number): Promise<Note[]>;
  getByVerseKey(verseKey: string): Promise<Note[]>;
  getByTag(tag: string): Promise<Note[]>;
  getForVerse(verseKey: string, surahId: number): Promise<Note[]>;
  getById(id: string): Promise<Note | null>;
  save(note: Note): Promise<void>;
  remove(id: string): Promise<void>;
}

/** Persistence for reading progress */
export interface ProgressRepository {
  getAll(): Promise<ReadingProgress[]>;
  getBySurah(surahId: number): Promise<ReadingProgress | null>;
  save(progress: ReadingProgress): Promise<void>;
}

/** Persistence for user preferences */
export interface PreferencesRepository {
  get(id?: string): Promise<UserPreferences | null>;
  save(preferences: UserPreferences): Promise<void>;
}
