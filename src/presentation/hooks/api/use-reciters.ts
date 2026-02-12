"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Reciter } from "@/core/types";

async function fetchReciters(): Promise<Reciter[]> {
  const res = await fetch("/api/v1/reciters");
  const json = (await res.json()) as ApiResponse<Reciter[]>;
  if (!json.ok) throw new Error(json.error.message);
  return json.data;
}

export function useReciters() {
  return useQuery({
    queryKey: ["reciters"],
    queryFn: fetchReciters,
    staleTime: Infinity,
  });
}
