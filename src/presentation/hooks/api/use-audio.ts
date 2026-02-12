"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, AudioRecitation } from "@/core/types";

async function fetchAudio(
  surahId: number,
  reciterId: number,
): Promise<AudioRecitation[]> {
  const res = await fetch(
    `/api/v1/audio?surah_id=${surahId}&reciter_id=${reciterId}`,
  );
  const json = (await res.json()) as ApiResponse<AudioRecitation[]>;
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}

export function useAudio(surahId: number | null, reciterId: number) {
  return useQuery({
    queryKey: ["audio", surahId, reciterId],
    queryFn: () => fetchAudio(surahId!, reciterId),
    enabled: !!surahId,
  });
}
