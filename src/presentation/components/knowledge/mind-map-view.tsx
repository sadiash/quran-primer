"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeMouseHandler,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { GraphNodeVerse } from "./graph-node-verse";
import { GraphNodeNote } from "./graph-node-note";
import { GraphNodeTheme } from "./graph-node-theme";
import { GraphEdgeCustom } from "./graph-edge-custom";

const nodeTypes = {
  verse: GraphNodeVerse,
  note: GraphNodeNote,
  theme: GraphNodeTheme,
} as const;

const edgeTypes = {
  custom: GraphEdgeCustom,
} as const;

export interface MindMapViewProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (nodeId: string) => void;
  /** When true, hides controls and minimap (for embedded/mini view) */
  minimal?: boolean;
  className?: string;
}

function MindMapViewInner({
  nodes,
  edges,
  onNodeClick,
  minimal = false,
  className,
}: MindMapViewProps) {
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick],
  );

  return (
    <div className={className ?? "h-full w-full"}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-background" />
        {!minimal && (
          <>
            <Controls
              showInteractive={false}
              className="!bg-background/80 !backdrop-blur-sm !border-border !shadow-sm"
            />
            <MiniMap
              nodeStrokeWidth={3}
              className="!bg-background/80 !backdrop-blur-sm !border-border"
              maskColor="hsl(var(--muted) / 0.3)"
            />
          </>
        )}
      </ReactFlow>
    </div>
  );
}

export function MindMapView(props: MindMapViewProps) {
  return (
    <ReactFlowProvider>
      <MindMapViewInner {...props} />
    </ReactFlowProvider>
  );
}
