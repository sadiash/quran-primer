"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GraphNode, GraphEdge } from "@/core/types";
import { getSurahName } from "@/lib/surah-names";
import { cn } from "@/lib/utils";

interface MindMapViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  className?: string;
}

/** Color palette per node type */
const NODE_STYLES: Record<
  string,
  { bg: string; border: string; color: string; fontSize: string }
> = {
  verse: {
    bg: "hsl(var(--primary) / 0.12)",
    border: "1.5px solid hsl(var(--primary) / 0.5)",
    color: "hsl(var(--primary))",
    fontSize: "11px",
  },
  note: {
    bg: "hsl(var(--card))",
    border: "1.5px solid hsl(var(--border))",
    color: "hsl(var(--card-foreground))",
    fontSize: "11px",
  },
  theme: {
    bg: "hsl(var(--primary) / 0.2)",
    border: "2px solid hsl(var(--primary))",
    color: "hsl(var(--primary))",
    fontSize: "12px",
  },
  bookmark: {
    bg: "hsl(var(--warning) / 0.15)",
    border: "1.5px solid hsl(var(--warning) / 0.5)",
    color: "hsl(var(--warning))",
    fontSize: "11px",
  },
};

const EDGE_STYLES: Record<string, { stroke: string; animated: boolean }> = {
  references: { stroke: "hsl(var(--primary) / 0.4)", animated: false },
  thematic: { stroke: "hsl(var(--primary) / 0.6)", animated: true },
  "same-surah": { stroke: "hsl(var(--muted-foreground) / 0.3)", animated: false },
  "user-linked": { stroke: "hsl(var(--primary) / 0.5)", animated: true },
};

/** Format a verse label nicely: "Al-Baqarah 2:255" */
function formatVerseLabel(verseKey: string): string {
  const [s, v] = verseKey.split(":");
  const name = getSurahName(Number(s));
  return `${name} ${s}:${v}`;
}

/** Simple force-directed-ish layout: themes in center ring, notes around, verses on outer ring */
function layoutNodes(nodes: GraphNode[], edges: GraphEdge[]): Node[] {
  if (nodes.length === 0) return [];

  // Group nodes by type
  const themes = nodes.filter((n) => n.nodeType === "theme");
  const notes = nodes.filter((n) => n.nodeType === "note");
  const verses = nodes.filter((n) => n.nodeType === "verse");
  const others = nodes.filter(
    (n) => n.nodeType !== "theme" && n.nodeType !== "note" && n.nodeType !== "verse",
  );

  const positions = new Map<string, { x: number; y: number }>();

  const cx = 600;
  const cy = 400;

  // Themes: inner ring
  const themeRadius = Math.max(120, themes.length * 30);
  themes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(themes.length, 1);
    positions.set(n.id, {
      x: cx + themeRadius * Math.cos(angle),
      y: cy + themeRadius * Math.sin(angle),
    });
  });

  // Notes: middle ring, clustered near their connected theme
  const noteRadius = themeRadius + 180;
  // Build adjacency: note → themes it connects to
  const noteToThemes = new Map<string, string[]>();
  for (const e of edges) {
    if (e.edgeType === "thematic") {
      const existing = noteToThemes.get(e.sourceNodeId) ?? [];
      existing.push(e.targetNodeId);
      noteToThemes.set(e.sourceNodeId, existing);
    }
  }

  notes.forEach((n, i) => {
    const connectedThemes = noteToThemes.get(n.id) ?? [];
    if (connectedThemes.length > 0 && positions.has(connectedThemes[0]!)) {
      // Place near first connected theme
      const tp = positions.get(connectedThemes[0]!)!;
      const jitter = (i % 5) * 50 - 100;
      positions.set(n.id, { x: tp.x + 100 + jitter, y: tp.y + 60 + (i % 3) * 50 });
    } else {
      const angle = (2 * Math.PI * i) / Math.max(notes.length, 1);
      positions.set(n.id, {
        x: cx + noteRadius * Math.cos(angle),
        y: cy + noteRadius * Math.sin(angle),
      });
    }
  });

  // Verses: outer ring, clustered near their connected note
  const noteToVerses = new Map<string, string[]>();
  for (const e of edges) {
    if (e.edgeType === "references") {
      const existing = noteToVerses.get(e.sourceNodeId) ?? [];
      existing.push(e.targetNodeId);
      noteToVerses.set(e.sourceNodeId, existing);
    }
  }

  const verseRadius = noteRadius + 160;
  const placedVerses = new Set<string>();

  // Place verses near their note
  for (const [noteId, verseIds] of noteToVerses) {
    const np = positions.get(noteId);
    if (!np) continue;
    verseIds.forEach((vid, vi) => {
      if (!placedVerses.has(vid)) {
        placedVerses.add(vid);
        positions.set(vid, { x: np.x + 120 + (vi % 3) * 60, y: np.y + (vi % 4) * 50 - 50 });
      }
    });
  }

  // Remaining verses: outer ring
  const remainingVerses = verses.filter((v) => !placedVerses.has(v.id));
  remainingVerses.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(remainingVerses.length, 1);
    positions.set(n.id, {
      x: cx + verseRadius * Math.cos(angle),
      y: cy + verseRadius * Math.sin(angle),
    });
  });

  // Others
  others.forEach((n, i) => {
    positions.set(n.id, { x: cx + (i % 4) * 120 - 200, y: cy + 300 + Math.floor(i / 4) * 80 });
  });

  return nodes.map((n) => {
    const pos = positions.get(n.id) ?? { x: 0, y: 0 };
    const defaultStyle = { bg: "hsl(var(--card))", border: "1.5px solid hsl(var(--border))", color: "hsl(var(--card-foreground))", fontSize: "11px" };
    const style = NODE_STYLES[n.nodeType] ?? defaultStyle;

    let label = n.label;
    if (n.nodeType === "verse" && n.verseKey) {
      label = formatVerseLabel(n.verseKey);
    } else if (n.nodeType === "note") {
      label = n.label.length > 50 ? n.label.slice(0, 50) + "..." : n.label;
    }

    return {
      id: n.id,
      type: "default",
      position: pos,
      data: { label },
      style: {
        background: style.bg,
        color: style.color,
        border: style.border,
        borderRadius: n.nodeType === "theme" ? "20px" : "8px",
        padding: n.nodeType === "theme" ? "6px 16px" : "6px 10px",
        fontSize: style.fontSize,
        fontWeight: n.nodeType === "theme" ? "600" : "400",
        maxWidth: "180px",
        lineHeight: "1.3",
      },
    };
  });
}

function toFlowEdges(edges: GraphEdge[]): Edge[] {
  return edges.map((e) => {
    const defaultEdge = { stroke: "hsl(var(--primary) / 0.4)", animated: false };
    const style = EDGE_STYLES[e.edgeType] ?? defaultEdge;
    return {
      id: e.id,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      animated: style.animated,
      style: { stroke: style.stroke, strokeWidth: e.edgeType === "thematic" ? 2 : 1 },
    };
  });
}

export function MindMapView({
  nodes,
  edges,
  onNodeClick,
  className,
}: MindMapViewProps) {
  const flowNodes = useMemo(() => layoutNodes(nodes, edges), [nodes, edges]);
  const flowEdges = useMemo(() => toFlowEdges(edges), [edges]);

  // Build lookup for GraphNode by id for click handler
  const nodeById = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const graphNode = nodeById.get(node.id);
      if (graphNode) onNodeClick?.(graphNode);
    },
    [onNodeClick, nodeById],
  );

  return (
    <div className={cn("h-full w-full", className)}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodeClick={handleNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
