"use client";

import type { NodeType, GraphStats } from "@/core/types";
import { NODE_COLORS, NODE_TYPE_LABELS } from "./constants";

interface GraphLegendProps {
  stats: GraphStats;
  activeTypes: Set<NodeType>;
}

export function GraphLegend({ stats, activeTypes }: GraphLegendProps) {
  const types = (Object.keys(stats.nodeCounts) as NodeType[]).filter((t) =>
    activeTypes.has(t),
  );

  if (types.length === 0) return null;

  return (
    <div className="absolute bottom-3 left-3 bg-background border border-border px-3 py-2 text-xs">
      <div className="grid gap-1">
        {types.map((type) => (
          <div key={type} className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: NODE_COLORS[type] }}
            />
            <span className="text-muted-foreground">
              {NODE_TYPE_LABELS[type]}
            </span>
            <span className="font-medium ml-auto tabular-nums">
              {stats.nodeCounts[type] ?? 0}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-border text-muted-foreground">
        {stats.totalNodes} nodes &middot; {stats.totalEdges} edges
      </div>
    </div>
  );
}
