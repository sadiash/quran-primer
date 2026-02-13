"use client";

import { useQuery } from "@tanstack/react-query";
import type { Node, Edge } from "@xyflow/react";
import type { KnowledgeGraph, GraphNode, GraphEdge } from "@/core/types";
import { KnowledgeGraphService } from "@/core/services/knowledge-graph-service";
import { DexieBookmarkRepository } from "@/infrastructure/db/client/bookmark-repo";
import { DexieNoteRepository } from "@/infrastructure/db/client/note-repo";

export interface UseKnowledgeGraphOptions {
  verseKey?: string;
  tag?: string;
  surahId?: number;
}

/**
 * Generate the knowledge graph client-side using Dexie (IndexedDB) repos.
 * The graph service reads bookmarks/notes from the browser's local database,
 * so this cannot run in a server-side API route.
 */
async function generateGraphClientSide(
  options?: UseKnowledgeGraphOptions,
): Promise<KnowledgeGraph> {
  const service = new KnowledgeGraphService({
    bookmarks: new DexieBookmarkRepository(),
    notes: new DexieNoteRepository(),
  });

  return service.generateGraph({
    verseKey: options?.verseKey,
    tag: options?.tag,
    surahId: options?.surahId,
  });
}

/**
 * Lay out nodes in a radial/circle arrangement.
 * Verse nodes form the inner ring, note/theme nodes fan out around their connections.
 */
function layoutNodes(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
): Node[] {
  const verseNodes = graphNodes.filter((n) => n.nodeType === "verse");
  const noteNodes = graphNodes.filter((n) => n.nodeType === "note");
  const themeNodes = graphNodes.filter((n) => n.nodeType === "theme");

  const positionMap = new Map<string, { x: number; y: number }>();

  // Place verse nodes in a circle
  const verseRadius = Math.max(150, verseNodes.length * 60);
  verseNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / Math.max(verseNodes.length, 1);
    positionMap.set(node.id, {
      x: Math.cos(angle) * verseRadius,
      y: Math.sin(angle) * verseRadius,
    });
  });

  // Build adjacency: for each non-verse node, find connected verse node
  const edgesBySource = new Map<string, GraphEdge[]>();
  for (const edge of graphEdges) {
    const existing = edgesBySource.get(edge.sourceNodeId);
    if (existing) {
      existing.push(edge);
    } else {
      edgesBySource.set(edge.sourceNodeId, [edge]);
    }
  }

  // Place note nodes near their connected verse, offset outward
  const noteOffset = 140;
  const noteCountPerVerse = new Map<string, number>();
  noteNodes.forEach((node) => {
    const edges = edgesBySource.get(node.id) ?? [];
    const connectedVerse = edges.find((e) => {
      const target = graphNodes.find((n) => n.id === e.targetNodeId);
      return target?.nodeType === "verse";
    });

    if (connectedVerse) {
      const versePos = positionMap.get(connectedVerse.targetNodeId);
      if (versePos) {
        const count = noteCountPerVerse.get(connectedVerse.targetNodeId) ?? 0;
        noteCountPerVerse.set(connectedVerse.targetNodeId, count + 1);
        const spreadAngle = ((count - 1) * 0.4);
        const baseAngle = Math.atan2(versePos.y, versePos.x);
        positionMap.set(node.id, {
          x: versePos.x + Math.cos(baseAngle + spreadAngle) * noteOffset,
          y: versePos.y + Math.sin(baseAngle + spreadAngle) * noteOffset,
        });
        return;
      }
    }

    // Fallback: place randomly
    positionMap.set(node.id, {
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 600,
    });
  });

  // Place theme nodes in an outer ring
  const themeRadius = verseRadius + 250;
  themeNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / Math.max(themeNodes.length, 1) + Math.PI / 4;
    positionMap.set(node.id, {
      x: Math.cos(angle) * themeRadius,
      y: Math.sin(angle) * themeRadius,
    });
  });

  return graphNodes.map((node) => {
    const pos = positionMap.get(node.id) ?? { x: 0, y: 0 };
    const rfNodeType =
      node.nodeType === "verse" || node.nodeType === "bookmark" || node.nodeType === "surah"
        ? "verse"
        : node.nodeType === "note"
          ? "note"
          : "theme";

    return {
      id: node.id,
      type: rfNodeType,
      position: pos,
      data: {
        label: node.label,
        verseKey: node.verseKey,
        surahId: node.surahId,
        metadata: node.metadata,
      },
    };
  });
}

function transformEdges(graphEdges: GraphEdge[]): Edge[] {
  return graphEdges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    type: "custom",
    data: {
      edgeType: edge.edgeType,
      weight: edge.weight,
    },
  }));
}

export function useKnowledgeGraph(options?: UseKnowledgeGraphOptions) {
  const query = useQuery({
    queryKey: ["knowledge-graph", options?.verseKey, options?.tag, options?.surahId],
    queryFn: () => generateGraphClientSide(options),
  });

  const nodes: Node[] = query.data ? layoutNodes(query.data.nodes, query.data.edges) : [];
  const edges: Edge[] = query.data ? transformEdges(query.data.edges) : [];

  return {
    nodes,
    edges,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
