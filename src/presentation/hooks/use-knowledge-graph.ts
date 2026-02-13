"use client";

import { useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/infrastructure/db/client";
import type { GraphNode, GraphEdge } from "@/core/types";

export interface UseKnowledgeGraphOptions {
  tag?: string;
  surahId?: number;
  verseKey?: string;
}

interface UseKnowledgeGraphResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useKnowledgeGraph(
  options?: UseKnowledgeGraphOptions,
): UseKnowledgeGraphResult {
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const rawNodes = useLiveQuery(
    async () => {
      try {
        if (options?.verseKey) {
          return db.graphNodes.where("verseKey").equals(options.verseKey).toArray();
        }
        if (options?.surahId) {
          return db.graphNodes.where("surahId").equals(options.surahId).toArray();
        }
        return db.graphNodes.toArray();
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to load nodes"));
        return [];
      }
    },
    [options?.verseKey, options?.surahId, options?.tag, refreshKey],
    undefined,
  );

  const rawEdges = useLiveQuery(
    async () => {
      try {
        return db.graphEdges.toArray();
      } catch (e) {
        setError(e instanceof Error ? e : new Error("Failed to load edges"));
        return [];
      }
    },
    [refreshKey],
    undefined,
  );

  const isLoading = rawNodes === undefined || rawEdges === undefined;

  const nodes: GraphNode[] = (rawNodes ?? []).map((n) => ({
    id: n.id,
    nodeType: n.nodeType as GraphNode["nodeType"],
    label: n.label,
    verseKey: n.verseKey,
    surahId: n.surahId,
    metadata: n.metadata ? JSON.parse(n.metadata) : undefined,
    createdAt: n.createdAt,
  }));

  const edges: GraphEdge[] = (rawEdges ?? []).map((e) => ({
    id: e.id,
    sourceNodeId: e.sourceNodeId,
    targetNodeId: e.targetNodeId,
    edgeType: e.edgeType as GraphEdge["edgeType"],
    weight: e.weight,
    createdAt: e.createdAt,
  }));

  // Filter edges to only include connected nodes
  const nodeIds = new Set(nodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) => nodeIds.has(e.sourceNodeId) && nodeIds.has(e.targetNodeId),
  );

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Reset error when filter options change — handled inside useLiveQuery callbacks

  return {
    nodes,
    edges: filteredEdges,
    isLoading,
    error,
    refetch,
  };
}
