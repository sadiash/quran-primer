"use client";

import { useState, useCallback } from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useFetch } from "@/presentation/hooks/use-fetch";
import { HadithCard } from "./hadith-card";
import type { TopicMatch } from "@/presentation/hooks/use-topic-search";
import type { Hadith } from "@/core/types";

interface TopicSearchResultsProps {
  matches: TopicMatch[];
  query: string;
}

export function TopicSearchResults({ matches, query }: TopicSearchResultsProps) {
  const totalHadiths = matches.reduce((sum, m) => sum + m.hadithCount, 0);

  return (
    <div>
      {/* Summary header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/20">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {matches.length} topic{matches.length !== 1 ? "s" : ""},{" "}
          {totalHadiths.toLocaleString()} hadith{totalHadiths !== 1 ? "s" : ""}{" "}
          for &ldquo;{query}&rdquo;
        </span>
      </div>

      {/* Topic sections */}
      <div className="space-y-8">
        {matches.map((topic) => (
          <TopicSection key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}

function TopicSection({ topic }: { topic: TopicMatch }) {
  const [limit, setLimit] = useState(20);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayName = topic.id
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

  const fetchUrl = `/api/v1/hadith/topic?name=${encodeURIComponent(topic.id)}&limit=${limit}&offset=0`;
  const fetchKey = `topic:${topic.id}:${limit}`;
  const { data: hadiths, isLoading } = useFetch<Hadith[]>(fetchUrl, fetchKey);

  const handleLoadMore = useCallback(() => {
    setLimit((prev) => prev + 20);
  }, []);

  return (
    <div>
      {/* Topic header */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 shrink-0"
            style={{ backgroundColor: "var(--surah-lavender-accent)" }}
          />
          <h3 className="font-display text-lg font-bold text-foreground">
            {displayName}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {topic.hadithCount.toLocaleString()} hadith{topic.hadithCount !== 1 ? "s" : ""}
          </span>
        </div>
        {topic.subTopics.length > 0 && (
          <div className="flex flex-wrap gap-1 ml-4">
            {topic.subTopics.slice(0, 5).map((sub) => (
              <span
                key={sub}
                className="font-mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5"
                style={{
                  backgroundColor: "var(--surah-lavender-bg)",
                  color: "var(--surah-lavender-label)",
                }}
              >
                {sub.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            ))}
            {topic.subTopics.length > 5 && (
              <span className="font-mono text-[9px] text-muted-foreground">
                +{topic.subTopics.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <CircleNotchIcon weight="bold" className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground">Loading hadiths...</span>
        </div>
      )}

      {/* Hadith cards */}
      {hadiths && hadiths.length > 0 && (
        <div className="space-y-2">
          {hadiths.map((h) => (
            <HadithCard
              key={`${h.collection}-${h.hadithNumber}`}
              hadith={h}
              expanded={expandedId === `${h.collection}-${h.hadithNumber}`}
              onToggle={() =>
                setExpandedId(
                  expandedId === `${h.collection}-${h.hadithNumber}`
                    ? null
                    : `${h.collection}-${h.hadithNumber}`,
                )
              }
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hadiths && limit < topic.hadithCount && (
        <button
          onClick={handleLoadMore}
          className="mt-3 w-full py-2 border border-border/20 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        >
          [ Load more — showing {hadiths.length} of {topic.hadithCount.toLocaleString()} ]
        </button>
      )}
    </div>
  );
}
