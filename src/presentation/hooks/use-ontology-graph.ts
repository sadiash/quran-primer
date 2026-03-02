"use client";

import { useState, useEffect, useMemo } from "react";
import type { ApiResponse, GraphNode, GraphEdge, GraphStats, QuranicConcept, HadithTopic } from "@/core/types";

interface UseOntologyGraphResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats;
  isLoading: boolean;
}

export type OntologyFilter = "all" | "quran" | "hadith";

export function useOntologyGraph(filter: OntologyFilter = "all"): UseOntologyGraphResult {
  const [concepts, setConcepts] = useState<QuranicConcept[] | null>(null);
  const [topics, setTopics] = useState<HadithTopic[] | null>(null);

  // Fetch both datasets on mount
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/v1/ontology?type=concepts")
        .then((r) => r.json())
        .then((json: ApiResponse<QuranicConcept[]>) => (json.ok ? json.data : [])),
      fetch("/api/v1/ontology?type=topics")
        .then((r) => r.json())
        .then((json: ApiResponse<HadithTopic[]>) => (json.ok ? json.data : [])),
    ])
      .then(([c, t]) => {
        if (!cancelled) {
          setConcepts(c);
          setTopics(t);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConcepts([]);
          setTopics([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { nodes, edges, stats } = useMemo(() => {
    if (!concepts || !topics) {
      return {
        nodes: [] as GraphNode[],
        edges: [] as GraphEdge[],
        stats: { nodeCounts: {}, edgeCounts: {}, totalNodes: 0, totalEdges: 0 } as GraphStats,
      };
    }

    const now = new Date();
    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];
    const dedupEdges = new Set<string>();

    // Build ALL concept nodes — including category nodes (0 verses)
    // which serve as connective tissue in the hierarchy
    const conceptIdSet = new Set<string>();
    for (const c of concepts) {
      conceptIdSet.add(c.id);
      const displayName = c.id.replace(/-/g, " ");
      const isCategory = c.verses.length === 0 && c.subcategories.length > 0;
      // Deduplicate verses
      const seenKeys = new Set<string>();
      const uniqueVerses = c.verses.filter((v) => {
        const key = `${v.surahId}:${v.verseId}`;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });
      graphNodes.push({
        id: `concept:${c.id}`,
        nodeType: "concept",
        label: displayName,
        metadata: {
          definition: c.definition,
          verseCount: uniqueVerses.length,
          verses: uniqueVerses,
          subcategories: c.subcategories,
          relatedConcepts: c.relatedConcepts,
          isCategory,
        },
        createdAt: now,
      });
    }

    // Build subcategory edges (parent → child hierarchy)
    for (const c of concepts) {
      for (const sub of c.subcategories) {
        if (conceptIdSet.has(sub.id)) {
          const edgeKey = `${c.id}->${sub.id}`;
          if (!dedupEdges.has(edgeKey)) {
            dedupEdges.add(edgeKey);
            graphEdges.push({
              id: `edge:${edgeKey}`,
              sourceNodeId: `concept:${c.id}`,
              targetNodeId: `concept:${sub.id}`,
              edgeType: "concept-related",
              weight: 1,
              createdAt: now,
            });
          }
        }
      }
    }

    // Build related concept edges (lateral connections between leaf nodes)
    for (const c of concepts) {
      for (const rc of c.relatedConcepts) {
        if (conceptIdSet.has(rc.id)) {
          // Deduplicate bidirectional edges (a~b === b~a)
          const sorted = [c.id, rc.id].sort();
          const edgeKey = `${sorted[0]}~${sorted[1]}`;
          if (!dedupEdges.has(edgeKey)) {
            dedupEdges.add(edgeKey);
            graphEdges.push({
              id: `edge:${edgeKey}`,
              sourceNodeId: `concept:${c.id}`,
              targetNodeId: `concept:${rc.id}`,
              edgeType: "concept-related",
              weight: 0.5,
              createdAt: now,
            });
          }
        }
      }
    }

    // Build topic nodes — same nodeType as concepts for unified treatment
    const topicIdSet = new Set<string>();
    for (const t of topics) {
      topicIdSet.add(t.id);
      const displayName = t.id
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
      graphNodes.push({
        id: `topic:${t.id}`,
        nodeType: "concept",
        label: displayName,
        metadata: {
          hadithCount: t.hadithCount,
          subTopics: t.subTopics,
          topicId: t.id,
        },
        createdAt: now,
      });
    }

    // Build topic → sub-topic edges
    for (const t of topics) {
      for (const sub of t.subTopics) {
        if (topicIdSet.has(sub)) {
          const edgeKey = `topic:${t.id}->topic:${sub}`;
          if (!dedupEdges.has(edgeKey)) {
            dedupEdges.add(edgeKey);
            graphEdges.push({
              id: `edge:${edgeKey}`,
              sourceNodeId: `topic:${t.id}`,
              targetNodeId: `topic:${sub}`,
              edgeType: "concept-related",
              weight: 1,
              createdAt: now,
            });
          }
        }
      }
    }

    // Apply source filter
    const filteredNodes = filter === "all"
      ? graphNodes
      : graphNodes.filter((n) =>
          filter === "quran" ? n.id.startsWith("concept:") : n.id.startsWith("topic:"),
        );
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = graphEdges.filter(
      (e) => filteredNodeIds.has(e.sourceNodeId) && filteredNodeIds.has(e.targetNodeId),
    );

    // Compute stats
    const nodeCounts: Record<string, number> = {};
    for (const n of filteredNodes) {
      nodeCounts[n.nodeType] = (nodeCounts[n.nodeType] ?? 0) + 1;
    }
    const edgeCounts: Record<string, number> = {};
    for (const e of filteredEdges) {
      edgeCounts[e.edgeType] = (edgeCounts[e.edgeType] ?? 0) + 1;
    }

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
      stats: {
        nodeCounts,
        edgeCounts,
        totalNodes: filteredNodes.length,
        totalEdges: filteredEdges.length,
      } as GraphStats,
    };
  }, [concepts, topics, filter]);

  return {
    nodes,
    edges,
    stats,
    isLoading: concepts === null || topics === null,
  };
}
