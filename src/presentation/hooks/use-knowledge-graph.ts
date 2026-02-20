"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/infrastructure/db/client";
import { DexieBookmarkRepository } from "@/infrastructure/db/client/bookmark-repo";
import { DexieNoteRepository } from "@/infrastructure/db/client/note-repo";
import {
  KnowledgeGraphService,
  type OntologyEnrichment,
} from "@/core/services/knowledge-graph-service";
import type {
  GraphNode,
  GraphEdge,
  GraphStats,
  QuranicConcept,
} from "@/core/types";

export interface UseKnowledgeGraphOptions {
  tag?: string;
  surahId?: number;
  verseKey?: string;
  includeOntologyHadiths?: boolean;
  includeQuranicConcepts?: boolean;
  includeHadithTopics?: boolean;
}

interface UseKnowledgeGraphResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  allTags: string[];
  stats: GraphStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const bookmarkRepo = new DexieBookmarkRepository();
const noteRepo = new DexieNoteRepository();
const graphService = new KnowledgeGraphService({
  bookmarks: bookmarkRepo,
  notes: noteRepo,
});

const emptyStats: GraphStats = {
  nodeCounts: {},
  edgeCounts: {},
  totalNodes: 0,
  totalEdges: 0,
};

// Client-side ontology cache (fetched once, reused across re-renders)
let cachedHadithVerseMap: Map<string, string[]> | null = null;
let cachedConceptsByVerse: Map<string, QuranicConcept[]> | null = null;
let cachedHadithTopicMap: Map<string, string[]> | null = null;

async function fetchOntologyData(
  type: "hadithVerses" | "concepts" | "hadithTopics",
): Promise<unknown> {
  if (type === "hadithVerses" && cachedHadithVerseMap) return cachedHadithVerseMap;
  if (type === "concepts" && cachedConceptsByVerse) return cachedConceptsByVerse;
  if (type === "hadithTopics" && cachedHadithTopicMap) return cachedHadithTopicMap;

  const apiBase = "/api/v1/ontology";
  if (type === "hadithVerses") {
    const res = await fetch(`${apiBase}?type=hadiths-all`);
    if (!res.ok) return new Map();
    const json = await res.json();
    const map = new Map<string, string[]>(
      Object.entries(json.data as Record<string, string[]>),
    );
    cachedHadithVerseMap = map;
    return map;
  }
  if (type === "concepts") {
    const res = await fetch(`${apiBase}?type=concepts`);
    if (!res.ok) return new Map();
    const json = await res.json();
    const concepts: QuranicConcept[] = json.data;
    // Index by verse key
    const map = new Map<string, QuranicConcept[]>();
    for (const c of concepts) {
      for (const v of c.verses ?? []) {
        const vk = `${v.surahId}:${v.verseId}`;
        const existing = map.get(vk);
        if (existing) existing.push(c);
        else map.set(vk, [c]);
      }
    }
    cachedConceptsByVerse = map;
    return map;
  }
  // hadithTopics
  const res = await fetch(`${apiBase}?type=topics-all`);
  if (!res.ok) return new Map();
  const json = await res.json();
  const map = new Map<string, string[]>(
    Object.entries(json.data as Record<string, string[]>),
  );
  cachedHadithTopicMap = map;
  return map;
}

export function useKnowledgeGraph(
  options?: UseKnowledgeGraphOptions,
): UseKnowledgeGraphResult {
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [ontology, setOntology] = useState<OntologyEnrichment>({});
  const fetchingRef = useRef<Set<string>>(new Set());

  // Fetch ontology data when toggles change
  useEffect(() => {
    let cancelled = false;
    const fetches: Promise<void>[] = [];

    if (options?.includeOntologyHadiths && !ontology.hadithVerseMap) {
      if (!fetchingRef.current.has("hadithVerses")) {
        fetchingRef.current.add("hadithVerses");
        fetches.push(
          fetchOntologyData("hadithVerses").then((map) => {
            if (!cancelled) {
              setOntology((prev) => ({
                ...prev,
                hadithVerseMap: map as Map<string, string[]>,
              }));
            }
            fetchingRef.current.delete("hadithVerses");
          }),
        );
      }
    }

    if (options?.includeQuranicConcepts && !ontology.conceptsByVerse) {
      if (!fetchingRef.current.has("concepts")) {
        fetchingRef.current.add("concepts");
        fetches.push(
          fetchOntologyData("concepts").then((map) => {
            if (!cancelled) {
              setOntology((prev) => ({
                ...prev,
                conceptsByVerse: map as Map<string, QuranicConcept[]>,
              }));
            }
            fetchingRef.current.delete("concepts");
          }),
        );
      }
    }

    if (options?.includeHadithTopics && !ontology.hadithTopicMap) {
      if (!fetchingRef.current.has("hadithTopics")) {
        fetchingRef.current.add("hadithTopics");
        fetches.push(
          fetchOntologyData("hadithTopics").then((map) => {
            if (!cancelled) {
              setOntology((prev) => ({
                ...prev,
                hadithTopicMap: map as Map<string, string[]>,
              }));
            }
            fetchingRef.current.delete("hadithTopics");
          }),
        );
      }
    }

    void Promise.all(fetches);
    return () => {
      cancelled = true;
    };
  }, [
    options?.includeOntologyHadiths,
    options?.includeQuranicConcepts,
    options?.includeHadithTopics,
    ontology.hadithVerseMap,
    ontology.conceptsByVerse,
    ontology.hadithTopicMap,
  ]);

  // Live-query that rebuilds the graph whenever bookmarks/notes change
  const baseGraph = useLiveQuery(
    async () => {
      try {
        await db.bookmarks.count();
        await db.notes.count();
        return graphService.generateGraph(options);
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to build graph"));
        return { nodes: [], edges: [] };
      }
    },
    [options?.verseKey, options?.surahId, options?.tag, refreshKey],
    undefined,
  );

  // Enrich with ontology data
  const enrichedGraph = useMemo(() => {
    if (!baseGraph) return undefined;
    const enrichment: OntologyEnrichment = {};
    if (options?.includeOntologyHadiths && ontology.hadithVerseMap) {
      enrichment.hadithVerseMap = ontology.hadithVerseMap;
    }
    if (options?.includeQuranicConcepts && ontology.conceptsByVerse) {
      enrichment.conceptsByVerse = ontology.conceptsByVerse;
    }
    if (options?.includeHadithTopics && ontology.hadithTopicMap) {
      enrichment.hadithTopicMap = ontology.hadithTopicMap;
    }
    if (Object.keys(enrichment).length === 0) return baseGraph;
    return graphService.enrichWithOntology(baseGraph, enrichment);
  }, [baseGraph, ontology, options?.includeOntologyHadiths, options?.includeQuranicConcepts, options?.includeHadithTopics]);

  const isLoading = enrichedGraph === undefined;
  const nodes = enrichedGraph?.nodes ?? [];
  const edges = enrichedGraph?.edges ?? [];

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const n of nodes) {
      if (n.nodeType === "theme") tags.add(n.label);
    }
    return [...tags].sort();
  }, [nodes]);

  const stats = useMemo(
    () =>
      enrichedGraph
        ? KnowledgeGraphService.computeStats(enrichedGraph)
        : emptyStats,
    [enrichedGraph],
  );

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    nodes,
    edges,
    allTags,
    stats,
    isLoading,
    error,
    refetch,
  };
}
