/** Drizzle ORM schema for PostgreSQL — server-side persistence */

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

export const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  verseKey: text("verse_key").notNull(),
  surahId: integer("surah_id").notNull(),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  verseKey: text("verse_key").notNull(),
  surahId: integer("surah_id").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const readingProgress = pgTable(
  "reading_progress",
  {
    userId: text("user_id").notNull(),
    surahId: integer("surah_id").notNull(),
    lastVerseKey: text("last_verse_key").notNull(),
    lastVerseNumber: integer("last_verse_number").notNull(),
    completedVerses: integer("completed_verses").notNull().default(0),
    totalVerses: integer("total_verses").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.surahId] })],
);

export const preferences = pgTable("preferences", {
  id: text("id").primaryKey(), // usually the userId
  theme: text("theme").notNull().default("system"),
  arabicFont: text("arabic_font").notNull().default("uthmani"),
  arabicFontSize: text("arabic_font_size").notNull().default("lg"),
  translationFontSize: text("translation_font_size").notNull().default("md"),
  showTranslation: boolean("show_translation").notNull().default(true),
  defaultTranslationId: integer("default_translation_id").notNull().default(131),
  defaultReciterId: integer("default_reciter_id").notNull().default(7),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
