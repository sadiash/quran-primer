"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { ApiResponse } from "@/core/types";

interface TopicData {
  id: string;
  subTopics: string[];
  hadithCount: number;
}

export interface TopicMatch {
  id: string;
  hadithCount: number;
  subTopics: string[];
}

/** Minimum query length before searching topics */
const MIN_QUERY_LENGTH = 2;
/** Maximum topics to return */
const MAX_RESULTS = 8;

/**
 * Splits a camelCase/PascalCase string into space-separated words.
 * e.g. "DayOfResurrection" → "day of resurrection"
 */
function camelToWords(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .toLowerCase();
}

/**
 * Hook that lazy-loads hadith topics and matches them against a search query.
 * Supports camelCase-aware matching (e.g. "resurrection" matches "DayOfResurrection").
 */
export function useTopicSearch(query: string) {
  const [topics, setTopics] = useState<TopicData[] | null>(null);
  const loadedRef = useRef(false);

  // Lazy-load topics on first search
  useEffect(() => {
    if (loadedRef.current || !query || query.length < MIN_QUERY_LENGTH) return;
    loadedRef.current = true;

    fetch("/api/v1/ontology?type=topics")
      .then((res) => res.json())
      .then((json: ApiResponse<TopicData[]>) => {
        if (json.ok) {
          setTopics(json.data);
        }
      })
      .catch(() => {
        // Silently fail — topic search is supplementary
      });
  }, [query]);

  const matches = useMemo((): TopicMatch[] => {
    if (!topics || !query || query.length < MIN_QUERY_LENGTH) return [];

    const q = query.toLowerCase().trim();

    const scored: { topic: TopicData; score: number }[] = [];

    for (const topic of topics) {
      const name = topic.id.toLowerCase();
      const words = camelToWords(topic.id);

      let score = 0;

      if (name === q || words === q) {
        score = 100; // Exact match
      } else if (name.startsWith(q) || words.startsWith(q)) {
        score = 80; // Prefix match
      } else if (name.includes(q) || words.includes(q)) {
        score = 60; // Substring match
      } else {
        // Check individual words
        const wordParts = words.split(" ");
        if (wordParts.some((w) => w.startsWith(q))) {
          score = 50; // Word prefix match
        }
      }

      if (score > 0) {
        scored.push({ topic, score });
      }
    }

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.topic.hadithCount - a.topic.hadithCount;
    });

    return scored.slice(0, MAX_RESULTS).map(({ topic }) => ({
      id: topic.id,
      hadithCount: topic.hadithCount,
      subTopics: topic.subTopics,
    }));
  }, [topics, query]);

  return {
    matches,
    isLoaded: topics !== null,
    isSearching: query.length >= MIN_QUERY_LENGTH,
  };
}
