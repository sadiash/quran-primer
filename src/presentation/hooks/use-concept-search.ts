"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { ApiResponse } from "@/core/types";

interface ConceptData {
  id: string;
  definition: string;
  verses: { surahId: number; verseId: number }[];
}

export interface ConceptMatch {
  id: string;
  definition: string;
  verses: { surahId: number; verseId: number; key: string }[];
}

/** Concepts that are too generic to show in search results */
const BLOCKED_CONCEPTS = new Set([
  "concept",
  "root",
  "allah",
  "god",
  "quran",
  "the-quran",
  "verse",
  "surah",
  "chapter",
  "book",
  "ayah",
  "word",
  "people",
  "man",
  "woman",
  "time",
  "day",
  "thing",
  "place",
  "world",
  "life",
  "water",
  "earth",
  "say",
  "said",
]);

/** Minimum query length before searching concepts */
const MIN_QUERY_LENGTH = 2;
/** Maximum concepts to return per search */
const MAX_RESULTS = 10;
/** Maximum verses per concept in results */
const MAX_VERSES_PER_CONCEPT = 20;

/**
 * Hook that lazy-loads Quranic concepts and matches them against a search query.
 * Returns matching concepts with their verse references.
 */
export function useConceptSearch(query: string) {
  const [concepts, setConcepts] = useState<ConceptData[] | null>(null);
  const loadedRef = useRef(false);

  // Lazy-load concepts on first search
  useEffect(() => {
    if (loadedRef.current || !query || query.length < MIN_QUERY_LENGTH) return;
    loadedRef.current = true;

    fetch("/api/v1/ontology?type=concepts")
      .then((res) => res.json())
      .then((json: ApiResponse<ConceptData[]>) => {
        if (json.ok) {
          // Filter out blocked/generic concepts and those with no verses
          const filtered = json.data.filter(
            (c) =>
              !BLOCKED_CONCEPTS.has(c.id.toLowerCase()) &&
              c.verses.length > 0 &&
              c.verses.length <= 500, // skip hyper-generic concepts
          );
          setConcepts(filtered);
        }
      })
      .catch(() => {
        // Silently fail — concept search is supplementary
      });
  }, [query]);

  const matches = useMemo((): ConceptMatch[] => {
    if (!concepts || !query || query.length < MIN_QUERY_LENGTH) return [];

    const q = query.toLowerCase().trim();

    // Score each concept
    const scored: { concept: ConceptData; score: number }[] = [];

    for (const concept of concepts) {
      const name = concept.id.toLowerCase().replace(/-/g, " ");
      const def = concept.definition.toLowerCase();

      let score = 0;

      if (name === q) {
        score = 100; // Exact match
      } else if (name.startsWith(q)) {
        score = 80; // Prefix match
      } else if (name.includes(q)) {
        score = 60; // Substring match
      } else if (def.includes(q)) {
        score = 30; // Definition match
      }

      // Also match individual words in hyphenated concept names
      if (score === 0) {
        const words = concept.id.toLowerCase().split("-");
        if (words.some((w) => w.startsWith(q))) {
          score = 50; // Word prefix match
        }
      }

      if (score > 0) {
        scored.push({ concept, score });
      }
    }

    // Sort by score (desc), then by verse count (desc, more relevant concepts first)
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.concept.verses.length - a.concept.verses.length;
    });

    return scored.slice(0, MAX_RESULTS).map(({ concept }) => ({
      id: concept.id,
      definition: concept.definition,
      verses: concept.verses.slice(0, MAX_VERSES_PER_CONCEPT).map((v) => ({
        ...v,
        key: `${v.surahId}:${v.verseId}`,
      })),
    }));
  }, [concepts, query]);

  const totalVerses = matches.reduce((sum, m) => sum + m.verses.length, 0);

  return {
    matches,
    totalVerses,
    isLoaded: concepts !== null,
    isSearching: query.length >= MIN_QUERY_LENGTH,
  };
}
