"use client";

import { useState } from "react";
import DOMPurify from "dompurify";
import { useTafsir, useTafsirResources } from "@/presentation/hooks/api";
import { Skeleton } from "@/presentation/components/ui";

interface TafsirPanelProps {
  verseKey: string;
}

const DEFAULT_TAFSIR_ID = 169; // Ibn Kathir (English)

export function TafsirPanel({ verseKey }: TafsirPanelProps) {
  const [selectedTafsirId, setSelectedTafsirId] = useState(DEFAULT_TAFSIR_ID);
  const { data: resources = [] } = useTafsirResources();
  const { data: tafsir, isLoading, error } = useTafsir(verseKey, selectedTafsirId);

  return (
    <div className="flex flex-col gap-4 rounded-xl glass p-4 shadow-soft-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Tafsir
        </h3>
        {resources.length > 0 && (
          <select
            value={selectedTafsirId}
            onChange={(e) => setSelectedTafsirId(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">
          Failed to load tafsir. Please try again.
        </p>
      )}

      {!isLoading && !error && !tafsir && (
        <p className="text-sm text-muted-foreground">
          No tafsir available for this verse.
        </p>
      )}

      {tafsir && (
        <div
          className="prose prose-sm max-w-none text-foreground dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(tafsir.text),
          }}
        />
      )}
    </div>
  );
}
