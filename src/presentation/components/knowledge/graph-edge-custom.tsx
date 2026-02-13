"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import type { EdgeType } from "@/core/types";

export interface CustomEdgeData {
  edgeType: EdgeType;
  weight?: number;
}

const edgeStyles: Record<EdgeType, { stroke: string; strokeDasharray?: string; label: string }> = {
  references: {
    stroke: "hsl(var(--primary))",
    label: "ref",
  },
  thematic: {
    stroke: "hsl(var(--accent-foreground))",
    strokeDasharray: "6 3",
    label: "theme",
  },
  "user-linked": {
    stroke: "hsl(var(--primary))",
    strokeDasharray: "4 4",
    label: "linked",
  },
  "same-surah": {
    stroke: "hsl(var(--muted-foreground))",
    strokeDasharray: "2 2",
    label: "surah",
  },
};

export function GraphEdgeCustom({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as unknown as CustomEdgeData | undefined;
  const edgeType = edgeData?.edgeType ?? "references";
  const style = edgeStyles[edgeType];

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: style.stroke,
          strokeDasharray: style.strokeDasharray,
          strokeWidth: selected ? 2 : 1,
          opacity: selected ? 1 : 0.6,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-none absolute rounded bg-background/80 px-1 py-0.5 text-[9px] text-muted-foreground"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          {style.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
