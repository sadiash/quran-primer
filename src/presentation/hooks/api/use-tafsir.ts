"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Tafsir } from "@/core/types";

async function fetchTafsir(verseKey: string, tafsirId: number): Promise<Tafsir> {
  const res = await fetch(
    `/api/v1/tafsir?verse_key=${encodeURIComponent(verseKey)}&tafsir_id=${tafsirId}`,
  );
  const json = (await res.json()) as ApiResponse<Tafsir>;
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}

export function useTafsir(verseKey: string | null, tafsirId: number) {
  return useQuery({
    queryKey: ["tafsir", verseKey, tafsirId],
    queryFn: () => fetchTafsir(verseKey!, tafsirId),
    enabled: !!verseKey,
  });
}
