/** Drizzle ORM schema for PostgreSQL — server-side persistence */

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  json,
  real,
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
  verseKeys: text("verse_keys").array().notNull().default([]),
  surahIds: integer("surah_ids").array().notNull().default([]),
  content: text("content").notNull(),
  contentJson: text("content_json"),
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
  defaultTranslationId: integer("default_translation_id").notNull().default(1001),
  activeTranslationIds: json("active_translation_ids").$type<number[]>().default([1001]),
  translationLayout: text("translation_layout").notNull().default("stacked"),
  showArabic: boolean("show_arabic").notNull().default(true),
  translationConfigs: json("translation_configs").$type<{ translationId: number; order: number; fontSize: string; colorSlot: number }[]>(),
  showConcepts: boolean("show_concepts").notNull().default(true),
  conceptMaxVisible: integer("concept_max_visible").notNull().default(5),
  conceptColorSlot: integer("concept_color_slot").notNull().default(0),
  defaultReciterId: integer("default_reciter_id").notNull().default(7),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const crossReferences = pgTable("cross_references", {
  id: text("id").primaryKey(),
  quranVerseKey: text("quran_verse_key").notNull(),
  scriptureRef: text("scripture_ref").notNull(),
  scriptureText: text("scripture_text").notNull(),
  source: text("source").notNull(),
  clusterSummary: text("cluster_summary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const graphNodes = pgTable("graph_nodes", {
  id: text("id").primaryKey(),
  nodeType: text("node_type").notNull(),
  label: text("label").notNull(),
  verseKey: text("verse_key"),
  surahId: integer("surah_id"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const graphEdges = pgTable("graph_edges", {
  id: text("id").primaryKey(),
  sourceNodeId: text("source_node_id").notNull(),
  targetNodeId: text("target_node_id").notNull(),
  edgeType: text("edge_type").notNull(),
  weight: real("weight"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
