/** Drizzle-backed reading progress repository — scoped by userId */

import { eq, and, desc } from "drizzle-orm";
import type { ProgressRepository } from "@/core/ports";
import type { ReadingProgress } from "@/core/types";
import type { DrizzleDb } from "./connection";
import { readingProgress } from "./schema";

export class DrizzleProgressRepository implements ProgressRepository {
  constructor(
    private readonly db: DrizzleDb,
    private readonly userId: string,
  ) {}

  async getAll(): Promise<ReadingProgress[]> {
    const rows = await this.db
      .select()
      .from(readingProgress)
      .where(eq(readingProgress.userId, this.userId))
      .orderBy(desc(readingProgress.updatedAt));

    return rows.map(toProgress);
  }

  async getBySurah(surahId: number): Promise<ReadingProgress | null> {
    const rows = await this.db
      .select()
      .from(readingProgress)
      .where(
        and(
          eq(readingProgress.userId, this.userId),
          eq(readingProgress.surahId, surahId),
        ),
      )
      .limit(1);

    return rows[0] ? toProgress(rows[0]) : null;
  }

  async save(progress: ReadingProgress): Promise<void> {
    await this.db
      .insert(readingProgress)
      .values({
        userId: this.userId,
        surahId: progress.surahId,
        lastVerseKey: progress.lastVerseKey,
        lastVerseNumber: progress.lastVerseNumber,
        completedVerses: progress.completedVerses,
        totalVerses: progress.totalVerses,
        updatedAt: progress.updatedAt,
      })
      .onConflictDoUpdate({
        target: [readingProgress.userId, readingProgress.surahId],
        set: {
          lastVerseKey: progress.lastVerseKey,
          lastVerseNumber: progress.lastVerseNumber,
          completedVerses: progress.completedVerses,
          updatedAt: progress.updatedAt,
        },
      });
  }
}

function toProgress(
  row: typeof readingProgress.$inferSelect,
): ReadingProgress {
  return {
    surahId: row.surahId,
    lastVerseKey: row.lastVerseKey,
    lastVerseNumber: row.lastVerseNumber,
    completedVerses: row.completedVerses,
    totalVerses: row.totalVerses,
    updatedAt: row.updatedAt,
  };
}
