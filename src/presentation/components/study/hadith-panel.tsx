"use client";

import { useRef, useState } from "react";
import DOMPurify from "dompurify";
import { useHadith } from "@/presentation/hooks/api";
import { Badge, Skeleton, Input } from "@/presentation/components/ui";
import { useVerseContext } from "@/presentation/hooks/use-verse-context";

export function HadithPanel() {
  const verseKey = useVerseContext();

  // Track previous verseKey to detect changes and reset the custom query
  const prevVerseKeyRef = useRef(verseKey);
  const [customQuery, setCustomQuery] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(verseKey ?? "");

  // When verseKey changes, reset custom query and input
  if (prevVerseKeyRef.current !== verseKey) {
    prevVerseKeyRef.current = verseKey;
    setCustomQuery(null);
    setSearchInput(verseKey ?? "");
  }

  const activeQuery = customQuery ?? verseKey ?? "";
  const { data: hadiths = [], isLoading, error } = useHadith(activeQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      setCustomQuery(trimmed);
    }
  };

  if (!verseKey) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
        <p className="text-sm">Select a verse to view related hadith</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Related Hadith for {verseKey}
      </h3>

      <form onSubmit={handleSearch}>
        <Input
          placeholder="Search hadith..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </form>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border p-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">
          Failed to load hadith. Please try again.
        </p>
      )}

      {!isLoading && !error && activeQuery && hadiths.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hadith found for this query.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {hadiths.map((hadith) => (
          <div
            key={hadith.id}
            className="rounded-lg border border-border p-3"
          >
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{hadith.collection}</Badge>
              {hadith.grade && (
                <Badge variant="outline">{hadith.grade}</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                #{hadith.hadithNumber}
              </span>
            </div>

            {hadith.narratedBy && (
              <p className="mb-1.5 text-xs italic text-muted-foreground">
                Narrated by {hadith.narratedBy}
              </p>
            )}

            <div
              className="prose prose-sm max-w-none text-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(hadith.text),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
