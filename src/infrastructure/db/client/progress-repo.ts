/** Dexie-backed reading progress repository */

import type { ProgressRepository } from "@/core/ports";
import type { ReadingProgress } from "@/core/types";
import { db } from "./schema";

export class DexieProgressRepository implements ProgressRepository {
  async getAll(): Promise<ReadingProgress[]> {
    return db.progress.orderBy("updatedAt").reverse().toArray();
  }

  async getBySurah(surahId: number): Promise<ReadingProgress | null> {
    const record = await db.progress.get(surahId);
    return record ?? null;
  }

  async save(progress: ReadingProgress): Promise<void> {
    await db.progress.put(progress);
  }
}
