"use client";

import { useState, useCallback, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/infrastructure/db/client";
import { DexieBookmarkRepository } from "@/infrastructure/db/client/bookmark-repo";
import { DexieNoteRepository } from "@/infrastructure/db/client/note-repo";
import { KnowledgeGraphService } from "@/core/services/knowledge-graph-service";
import type { GraphNode, GraphEdge } from "@/core/types";

export interface UseKnowledgeGraphOptions {
  tag?: string;
  surahId?: number;
  verseKey?: string;
}

interface UseKnowledgeGraphResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  allTags: string[];
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

export function useKnowledgeGraph(
  options?: UseKnowledgeGraphOptions,
): UseKnowledgeGraphResult {
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Live-query that rebuilds the graph whenever bookmarks/notes change
  const graph = useLiveQuery(
    async () => {
      try {
        // Touch both tables so Dexie tracks them for reactivity
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

  const isLoading = graph === undefined;
  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];

  // Collect all unique tags across note nodes
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const n of nodes) {
      if (n.nodeType === "theme") tags.add(n.label);
    }
    return [...tags].sort();
  }, [nodes]);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    nodes,
    edges,
    allTags,
    isLoading,
    error,
    refetch,
  };
}
