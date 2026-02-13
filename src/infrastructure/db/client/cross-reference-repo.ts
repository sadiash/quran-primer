/** Dexie-backed cross-reference repository for local caching */

import type { CrossReference, ScriptureSource } from "@/core/types";
import type { CrossReferenceRecord } from "./schema";
import { db } from "./schema";

export interface CrossReferenceRepository {
  getAll(): Promise<CrossReference[]>;
  getByVerseKey(quranVerseKey: string): Promise<CrossReference[]>;
  getBySource(source: ScriptureSource): Promise<CrossReference[]>;
  save(ref: CrossReference): Promise<void>;
  saveMany(refs: CrossReference[]): Promise<void>;
  remove(id: string): Promise<void>;
  removeByVerseKey(quranVerseKey: string): Promise<void>;
}

function toModel(r: CrossReferenceRecord): CrossReference {
  return {
    id: r.id,
    quranVerseKey: r.quranVerseKey,
    scriptureRef: r.scriptureRef,
    scriptureText: r.scriptureText,
    source: r.source as ScriptureSource,
    clusterSummary: r.clusterSummary,
    createdAt: r.createdAt,
  };
}

export class DexieCrossReferenceRepository implements CrossReferenceRepository {
  async getAll(): Promise<CrossReference[]> {
    const records = await db.crossReferences.orderBy("createdAt").reverse().toArray();
    return records.map(toModel);
  }

  async getByVerseKey(quranVerseKey: string): Promise<CrossReference[]> {
    const records = await db.crossReferences
      .where("quranVerseKey")
      .equals(quranVerseKey)
      .toArray();
    return records.map(toModel);
  }

  async getBySource(source: ScriptureSource): Promise<CrossReference[]> {
    const records = await db.crossReferences
      .where("source")
      .equals(source)
      .toArray();
    return records.map(toModel);
  }

  async save(ref: CrossReference): Promise<void> {
    await db.crossReferences.put({
      id: ref.id,
      quranVerseKey: ref.quranVerseKey,
      scriptureRef: ref.scriptureRef,
      scriptureText: ref.scriptureText,
      source: ref.source,
      clusterSummary: ref.clusterSummary,
      createdAt: ref.createdAt,
    });
  }

  async saveMany(refs: CrossReference[]): Promise<void> {
    await db.crossReferences.bulkPut(
      refs.map((ref) => ({
        id: ref.id,
        quranVerseKey: ref.quranVerseKey,
        scriptureRef: ref.scriptureRef,
        scriptureText: ref.scriptureText,
        source: ref.source,
        clusterSummary: ref.clusterSummary,
        createdAt: ref.createdAt,
      })),
    );
  }

  async remove(id: string): Promise<void> {
    await db.crossReferences.delete(id);
  }

  async removeByVerseKey(quranVerseKey: string): Promise<void> {
    await db.crossReferences
      .where("quranVerseKey")
      .equals(quranVerseKey)
      .delete();
  }
}
