"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GraphNode, GraphEdge } from "@/core/types";
import { cn } from "@/lib/utils";

interface MindMapViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

function toFlowNodes(nodes: GraphNode[]): Node[] {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  return nodes.map((n, i) => ({
    id: n.id,
    type: "default",
    position: {
      x: (i % cols) * 200 + Math.random() * 40,
      y: Math.floor(i / cols) * 120 + Math.random() * 40,
    },
    data: { label: n.label },
    style: {
      background: "hsl(var(--card))",
      color: "hsl(var(--card-foreground))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "8px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  }));
}

function toFlowEdges(edges: GraphEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    animated: true,
    style: { stroke: "hsl(var(--primary) / 0.4)" },
  }));
}

export function MindMapView({
  nodes,
  edges,
  onNodeClick,
  className,
}: MindMapViewProps) {
  const flowNodes = toFlowNodes(nodes);
  const flowEdges = toFlowEdges(edges);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick],
  );

  return (
    <div className={cn("h-full w-full", className)}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodeClick={handleNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
