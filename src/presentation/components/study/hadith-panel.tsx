"use client";

import { useState } from "react";
import DOMPurify from "dompurify";
import { useHadith } from "@/presentation/hooks/api";
import { Badge, Skeleton, Input } from "@/presentation/components/ui";

interface HadithPanelProps {
  defaultQuery: string;
}

export function HadithPanel({ defaultQuery }: HadithPanelProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [searchInput, setSearchInput] = useState(defaultQuery);
  const { data: hadiths = [], isLoading, error } = useHadith(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput.trim());
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl glass p-4 shadow-soft-md">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Related Hadith
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

      {!isLoading && !error && query && hadiths.length === 0 && (
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
