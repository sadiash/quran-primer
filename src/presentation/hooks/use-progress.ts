"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/infrastructure/db/client";
import type { ReadingProgress } from "@/core/types";

export function useProgress(surahId?: number) {
  const progress = useLiveQuery(
    () =>
      surahId !== undefined ? db.progress.get(surahId) : undefined,
    [surahId],
    undefined as ReadingProgress | undefined,
  );

  const allProgress = useLiveQuery(
    () => db.progress.orderBy("updatedAt").reverse().toArray(),
    [],
    [] as ReadingProgress[],
  );

  function getLatestProgress(): ReadingProgress | undefined {
    return allProgress[0];
  }

  async function updateProgress(data: ReadingProgress): Promise<void> {
    await db.progress.put(data);
  }

  return { progress, allProgress, updateProgress, getLatestProgress };
}
