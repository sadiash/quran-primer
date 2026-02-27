"use client";

import type { SimulationNode } from "@/core/types";
import { NODE_COLORS, NODE_TYPE_LABELS } from "./constants";

interface GraphTooltipProps {
  node: SimulationNode;
  x: number;
  y: number;
  connectionCount: number;
}

export function GraphTooltip({ node, x, y, connectionCount }: GraphTooltipProps) {
  const preview =
    (node.metadata?.preview as string) ??
    (node.metadata?.definition as string) ??
    "";

  return (
    <div
      className="absolute z-50 pointer-events-none bg-background text-foreground border border-border shadow-md px-3 py-2 text-xs max-w-64"
      style={{
        left: x + 12,
        top: y - 8,
      }}
    >
      {/* Type badge */}
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="inline-block size-2.5 rounded-full"
          style={{ backgroundColor: NODE_COLORS[node.nodeType] }}
        />
        <span className="font-medium text-muted-foreground">
          {NODE_TYPE_LABELS[node.nodeType]}
        </span>
      </div>

      {/* Label */}
      <div className="font-semibold text-sm mb-0.5 line-clamp-2">{node.label}</div>

      {/* Preview */}
      {preview && (
        <p className="text-muted-foreground line-clamp-2 mb-1">{preview}</p>
      )}

      {/* Connection count */}
      <div className="text-muted-foreground">
        {connectionCount} connection{connectionCount !== 1 ? "s" : ""}
      </div>

      {/* Hint */}
      <div className="mt-1 text-muted-foreground/60 italic">
        Click to lock &middot; Drag to move
      </div>
    </div>
  );
}
