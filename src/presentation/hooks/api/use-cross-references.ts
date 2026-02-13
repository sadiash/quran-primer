"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, CrossScriptureCluster } from "@/core/types";

async function fetchCrossReferences(
  verseKey: string,
): Promise<CrossScriptureCluster[]> {
  const res = await fetch(
    `/api/v1/cross-references?verse_key=${encodeURIComponent(verseKey)}`,
  );
  const json = (await res.json()) as ApiResponse<CrossScriptureCluster[]>;
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}

export function useCrossReferences(verseKey: string | null) {
  return useQuery({
    queryKey: ["cross-references", verseKey],
    queryFn: () => fetchCrossReferences(verseKey!),
    enabled: !!verseKey,
  });
}
