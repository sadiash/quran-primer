"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, TafsirResource } from "@/core/types";

async function fetchTafsirResources(): Promise<TafsirResource[]> {
  const res = await fetch("/api/v1/tafsirs");
  const json = (await res.json()) as ApiResponse<TafsirResource[]>;
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}

export function useTafsirResources() {
  return useQuery({
    queryKey: ["tafsir-resources"],
    queryFn: fetchTafsirResources,
    staleTime: Infinity,
  });
}
