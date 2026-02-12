"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "@/core/types";
import type { Verse } from "@/core/types";

async function fetchSearch(query: string): Promise<Verse[]> {
  const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`);
  const json = (await res.json()) as ApiResponse<Verse[]>;
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => fetchSearch(query),
    enabled: query.trim().length > 0,
  });
}
