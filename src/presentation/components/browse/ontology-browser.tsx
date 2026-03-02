"use client";

import { useState, useCallback, useEffect } from "react";
import { useSessionState } from "@/presentation/hooks/use-session-state";
import { BookOpenIcon, BookBookmarkIcon, CircleNotchIcon, type IconWeight } from "@phosphor-icons/react";
import { NetworkGraph } from "@/presentation/components/knowledge/network-graph/network-graph";
import { NodeDetailPanel } from "./node-detail-panel";
import { useOntologyGraph, type OntologyFilter } from "@/presentation/hooks/use-ontology-graph";
import type { GraphNode } from "@/core/types";
import type { BrowseTab } from "@/app/(app)/browse/browse-tabs";
import { BrowseTabs } from "@/app/(app)/browse/browse-tabs";
import { cn } from "@/lib/utils";

const FILTERS: { id: OntologyFilter; label: string; icon?: React.ComponentType<{ className?: string; weight?: IconWeight }> }[] = [
  { id: "all", label: "All" },
  { id: "quran", label: "Quran", icon: BookOpenIcon },
  { id: "hadith", label: "Hadith", icon: BookBookmarkIcon },
];

export function OntologyBrowser({ activeTab, onTabChange }: { activeTab?: BrowseTab; onTabChange?: (tab: BrowseTab) => void } = {}) {
  const [filter, setFilter] = useSessionState<OntologyFilter>("concepts:filter", "all");
  const { nodes, edges, stats, isLoading } = useOntologyGraph(filter);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [savedNodeId, setSavedNodeId] = useSessionState<string | null>("concepts:selectedNode", null);

  // Restore selected node from session when data loads
  useEffect(() => {
    if (savedNodeId && nodes.length > 0 && !selectedNode) {
      const found = nodes.find((n) => n.id === savedNodeId);
      if (found) setSelectedNode(found);
    }
  }, [savedNodeId, nodes, selectedNode]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setSavedNodeId(node.id);
  }, [setSavedNodeId]);

  const handleClose = useCallback(() => {
    setSelectedNode(null);
    setSavedNodeId(null);
  }, [setSavedNodeId]);

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
      <div className="shrink-0 px-6 py-5 sm:px-10 border-b border-border">
        {activeTab && onTabChange && (
          <div className="mb-4">
            <BrowseTabs active={activeTab} onChange={onTabChange} />
          </div>
        )}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-none text-foreground">
              {stats.totalNodes} Concepts
            </h1>
            <div className="flex items-center gap-1 mt-3">
              {FILTERS.map((f) => {
                const isActive = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] border transition-colors",
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground",
                    )}
                  >
                    {f.icon && <f.icon className="h-3 w-3" weight={isActive ? "fill" : "bold"} />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
          <span className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground text-right">
            {stats.totalEdges} connections
          </span>
        </div>
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
