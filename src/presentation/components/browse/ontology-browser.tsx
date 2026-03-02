"use client";

import { useState, useCallback } from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { NetworkGraph } from "@/presentation/components/knowledge/network-graph/network-graph";
import { NodeDetailPanel } from "./node-detail-panel";
import { useOntologyGraph } from "@/presentation/hooks/use-ontology-graph";
import type { GraphNode } from "@/core/types";

export function OntologyBrowser() {
  const { nodes, edges, stats, isLoading } = useOntologyGraph();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Ontology toggles are hardcoded on for this view
  const noop = useCallback(() => {}, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24">
        <CircleNotchIcon weight="bold" className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          Loading ontology graph...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Stats header */}
      <div className="shrink-0 px-4 py-2 border-b border-border/20">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {stats.totalNodes} concepts, {stats.totalEdges} connections
        </span>
      </div>

      {/* Graph + detail panel */}
      <div className="flex-1 min-h-0 flex">
        {/* Graph area */}
        <div className={selectedNode ? "flex-1 min-w-0 hidden md:block" : "flex-1 min-w-0"}>
          <NetworkGraph
            nodes={nodes}
            edges={edges}
            stats={stats}
            allTags={[]}
            onNodeClick={handleNodeClick}
            minimal
            includeOntologyHadiths={false}
            onToggleOntologyHadiths={noop}
            includeQuranicConcepts={true}
            onToggleQuranicConcepts={noop}
            includeHadithTopics={true}
            onToggleHadithTopics={noop}
          />
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <div className="w-full md:w-[420px] md:max-w-[50%] shrink-0 border-l border-border">
            <NodeDetailPanel node={selectedNode} onClose={handleClose} />
          </div>
        )}
      </div>
    </div>
  );
}
