"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { drag as d3Drag, type DragBehavior, type SubjectPosition } from "d3-drag";
import type { Simulation, SimulationLinkDatum } from "d3-force";
import type { SimulationNode, SimulationEdge } from "@/core/types";
import { ZOOM_EXTENT } from "./constants";

export interface HoveredNode {
  node: SimulationNode;
  x: number;
  y: number;
}

interface UseGraphInteractionsOptions {
  svgRef: React.RefObject<SVGSVGElement | null>;
  simulation: Simulation<SimulationNode, SimulationLinkDatum<SimulationNode>> | null;
  simulationEdges: SimulationEdge[];
  onNodeClick?: (node: SimulationNode) => void;
}

export interface UseGraphInteractionsResult {
  hoveredNode: HoveredNode | null;
  lockedNode: SimulationNode | null;
  highlightedIds: Set<string>;
  transform: { x: number; y: number; k: number };
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> | null;
  dragBehavior: DragBehavior<SVGCircleElement, SimulationNode, SubjectPosition> | null;
  resetView: () => void;
  handleNodeHover: (node: SimulationNode | null, screenX?: number, screenY?: number) => void;
  handleNodeClick: (node: SimulationNode) => void;
}

/** Find all node IDs connected to a given node */
function getConnectedIds(
  nodeId: string,
  edges: SimulationEdge[],
): Set<string> {
  const ids = new Set<string>([nodeId]);
  for (const e of edges) {
    const srcId = typeof e.source === "string" ? e.source : e.source.id;
    const tgtId = typeof e.target === "string" ? e.target : e.target.id;
    if (srcId === nodeId) ids.add(tgtId);
    if (tgtId === nodeId) ids.add(srcId);
  }
  return ids;
}

export function useGraphInteractions({
  svgRef,
  simulation,
  simulationEdges,
  onNodeClick,
}: UseGraphInteractionsOptions): UseGraphInteractionsResult {
  const [hoveredNode, setHoveredNode] = useState<HoveredNode | null>(null);
  const [lockedNode, setLockedNode] = useState<SimulationNode | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const dragBehaviorRef = useRef<DragBehavior<
    SVGCircleElement,
    SimulationNode,
    SubjectPosition
  > | null>(null);

  const edgesRef = useRef(simulationEdges);
  edgesRef.current = simulationEdges;

  // ── Zoom ────────────────────────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const zoomB = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent(ZOOM_EXTENT)
      .on("zoom", (event) => {
        const t = event.transform;
        setTransform({ x: t.x, y: t.y, k: t.k });
      });

    select(svg).call(zoomB);
    zoomBehaviorRef.current = zoomB;

    return () => {
      select(svg).on(".zoom", null);
    };
  }, [svgRef]);

  // ── Drag ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!simulation) return;

    const dragB = d3Drag<SVGCircleElement, SimulationNode, SubjectPosition>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    dragBehaviorRef.current = dragB;
  }, [simulation]);

  // ── Hover ───────────────────────────────────────────────────────────
  const handleNodeHover = useCallback(
    (node: SimulationNode | null, screenX?: number, screenY?: number) => {
      if (lockedNode) return;
      if (node) {
        setHoveredNode({
          node,
          x: screenX ?? node.x ?? 0,
          y: screenY ?? node.y ?? 0,
        });
        setHighlightedIds(getConnectedIds(node.id, edgesRef.current));
      } else {
        setHoveredNode(null);
        setHighlightedIds(new Set());
      }
    },
    [lockedNode],
  );

  // ── Click ───────────────────────────────────────────────────────────
  const handleNodeClick = useCallback(
    (node: SimulationNode) => {
      if (lockedNode?.id === node.id) {
        setLockedNode(null);
        setHighlightedIds(new Set());
        setHoveredNode(null);
      } else {
        setLockedNode(node);
        setHighlightedIds(getConnectedIds(node.id, edgesRef.current));
        onNodeClick?.(node);
      }
    },
    [lockedNode, onNodeClick],
  );

  // ── Background click → clear lock ──────────────────────────────────
  const handleBackgroundClick = useCallback(() => {
    setLockedNode(null);
    setHighlightedIds(new Set());
    setHoveredNode(null);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: MouseEvent) => {
      if (
        (e.target as Element).tagName === "svg" ||
        (e.target as Element).classList.contains("graph-bg")
      ) {
        handleBackgroundClick();
      }
    };
    svg.addEventListener("click", handler);
    return () => svg.removeEventListener("click", handler);
  }, [svgRef, handleBackgroundClick]);

  // ── Reset view ─────────────────────────────────────────────────────
  const resetView = useCallback(() => {
    const svg = svgRef.current;
    const zoomB = zoomBehaviorRef.current;
    if (!svg || !zoomB) return;
    select(svg)
      .transition()
      .duration(500)
      .call(zoomB.transform, zoomIdentity);
    setLockedNode(null);
    setHighlightedIds(new Set());
    setHoveredNode(null);
  }, [svgRef]);

  return {
    hoveredNode,
    lockedNode,
    highlightedIds,
    transform,
    zoomBehavior: zoomBehaviorRef.current,
    dragBehavior: dragBehaviorRef.current,
    resetView,
    handleNodeHover,
    handleNodeClick,
  };
}
