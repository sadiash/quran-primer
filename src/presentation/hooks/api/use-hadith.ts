"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Hadith } from "@/core/types";

async function fetchHadith(
  query: string,
  collection?: string,
): Promise<Hadith[]> {
  const params = new URLSearchParams({ q: query });
  if (collection) params.set("collection", collection);

  const res = await fetch(`/api/v1/hadith?${params.toString()}`);
  const json = (await res.json()) as ApiResponse<Hadith[]>;
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}

export function useHadith(query: string, collection?: string) {
  return useQuery({
    queryKey: ["hadith", query, collection],
    queryFn: () => fetchHadith(query, collection),
    enabled: query.trim().length > 0,
  });
}
