"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import type { GraphNode, GraphEdge, GraphStats, NodeType, SimulationNode, SimulationEdge } from "@/core/types";
import { useForceSimulation } from "./use-force-simulation";
import { useGraphInteractions } from "./use-graph-interactions";
import { GraphControls } from "./graph-controls";
import { GraphSearch } from "./graph-search";
import { GraphTooltip } from "./graph-tooltip";
import { GraphLegend } from "./graph-legend";
import {
  NODE_COLORS,
  NODE_SIZES,
  EDGE_STYLES,
  PARTICLE_RADIUS,
  PARTICLE_SPEED,
} from "./constants";

interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: GraphStats;
  allTags: string[];
  onNodeClick?: (node: GraphNode) => void;
  className?: string;
  // Ontology state (lifted to parent)
  includeOntologyHadiths: boolean;
  onToggleOntologyHadiths: () => void;
  includeQuranicConcepts: boolean;
  onToggleQuranicConcepts: () => void;
  includeHadithTopics: boolean;
  onToggleHadithTopics: () => void;
}

export function NetworkGraph({
  nodes,
  edges,
  stats,
  allTags,
  onNodeClick,
  className = "",
  includeOntologyHadiths,
  onToggleOntologyHadiths,
  includeQuranicConcepts,
  onToggleQuranicConcepts,
  includeHadithTopics,
  onToggleHadithTopics,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Controls state
  const [visibleTypes, setVisibleTypes] = useState<Set<NodeType>>(
    new Set([
      "verse", "note", "hadith", "concept", "theme",
      "hadith-topic", "bookmark", "surah",
    ]),
  );
  const [showLabels, setShowLabels] = useState(true);
  const [showParticles, setShowParticles] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchMatchIds, setSearchMatchIds] = useState<Set<string> | null>(null);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Filter nodes by visible types
  const filteredNodes = useMemo(
    () => nodes.filter((n) => visibleTypes.has(n.nodeType)),
    [nodes, visibleTypes],
  );
  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes],
  );
  const filteredEdges = useMemo(
    () =>
      edges.filter(
        (e) => filteredNodeIds.has(e.sourceNodeId) && filteredNodeIds.has(e.targetNodeId),
      ),
    [edges, filteredNodeIds],
  );

  // Active node types (types that actually exist in the data)
  const activeNodeTypes = useMemo(() => {
    const types = new Set<NodeType>();
    for (const n of nodes) types.add(n.nodeType);
    return types;
  }, [nodes]);

  // D3 simulation
  const { simulationNodes, simulationEdges, simulation, reheat } =
    useForceSimulation({
      nodes: filteredNodes,
      edges: filteredEdges,
      width: dimensions.width,
      height: dimensions.height,
    });

  // Interactions
  const {
    hoveredNode,
    highlightedIds,
    transform,
    dragBehavior,
    resetView,
    handleNodeHover,
    handleNodeClick: interactionNodeClick,
  } = useGraphInteractions({
    svgRef,
    simulation,
    simulationEdges,
    onNodeClick: onNodeClick as ((node: SimulationNode) => void) | undefined,
  });

  // Attach drag behavior to node circles
  useEffect(() => {
    if (!dragBehavior || !svgRef.current) return;
    const nodeCircles = select(svgRef.current).selectAll<SVGCircleElement, SimulationNode>(
      ".node-circle",
    );
    nodeCircles.call(dragBehavior);
  }, [dragBehavior, simulationNodes]);

  // Controls handlers
  const handleToggleType = useCallback((type: NodeType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleTagFilter = useCallback((tag: string | null) => {
    setActiveTag(tag);
  }, []);

  // Connection count for tooltip
  const tooltipConnectionCount = useMemo(() => {
    if (!hoveredNode) return 0;
    let count = 0;
    for (const e of simulationEdges) {
      const srcId = typeof e.source === "string" ? e.source : e.source.id;
      const tgtId = typeof e.target === "string" ? e.target : e.target.id;
      if (srcId === hoveredNode.node.id || tgtId === hoveredNode.node.id) count++;
    }
    return count;
  }, [hoveredNode, simulationEdges]);

  // Determine opacity for nodes/edges
  const hasHighlight = highlightedIds.size > 0;
  const hasSearch = searchMatchIds !== null;

  const getNodeOpacity = useCallback(
    (nodeId: string) => {
      if (hasSearch && !searchMatchIds!.has(nodeId)) return 0.08;
      if (hasHighlight && !highlightedIds.has(nodeId)) return 0.08;
      return 1;
    },
    [hasHighlight, hasSearch, highlightedIds, searchMatchIds],
  );

  const getEdgeOpacity = useCallback(
    (edge: SimulationEdge) => {
      const srcId = typeof edge.source === "string" ? edge.source : edge.source.id;
      const tgtId = typeof edge.target === "string" ? edge.target : edge.target.id;
      const baseOpacity = EDGE_STYLES[edge.edgeType]?.opacity ?? 0.3;
      if (hasSearch) {
        if (!searchMatchIds!.has(srcId) || !searchMatchIds!.has(tgtId)) return 0.03;
      }
      if (hasHighlight) {
        if (!highlightedIds.has(srcId) || !highlightedIds.has(tgtId)) return 0.03;
      }
      return baseOpacity;
    },
    [hasHighlight, hasSearch, highlightedIds, searchMatchIds],
  );

  // Particle animation
  const particleRef = useRef<number>(0);
  useEffect(() => {
    if (!showParticles) return;
    let frameId: number;
    const tick = () => {
      particleRef.current = (particleRef.current + PARTICLE_SPEED) % 1;
      const particles = svgRef.current?.querySelectorAll(".edge-particle");
      if (particles) {
        particles.forEach((p) => {
          const pathEl = p.previousElementSibling as SVGLineElement | null;
          if (!pathEl) return;
          const x1 = Number(pathEl.getAttribute("x1") ?? 0);
          const y1 = Number(pathEl.getAttribute("y1") ?? 0);
          const x2 = Number(pathEl.getAttribute("x2") ?? 0);
          const y2 = Number(pathEl.getAttribute("y2") ?? 0);
          const t = particleRef.current;
          p.setAttribute("cx", String(x1 + (x2 - x1) * t));
          p.setAttribute("cy", String(y1 + (y2 - y1) * t));
        });
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [showParticles]);

  // Reheat when tag filter changes
  useEffect(() => {
    reheat();
  }, [activeTag, reheat]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Top controls bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <GraphControls
          visibleTypes={visibleTypes}
          onToggleType={handleToggleType}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels((v) => !v)}
          showParticles={showParticles}
          onToggleParticles={() => setShowParticles((v) => !v)}
          onResetView={resetView}
          includeOntologyHadiths={includeOntologyHadiths}
          onToggleOntologyHadiths={onToggleOntologyHadiths}
          includeQuranicConcepts={includeQuranicConcepts}
          onToggleQuranicConcepts={onToggleQuranicConcepts}
          includeHadithTopics={includeHadithTopics}
          onToggleHadithTopics={onToggleHadithTopics}
          allTags={allTags}
          activeTag={activeTag}
          onTagFilter={handleTagFilter}
          activeNodeTypes={activeNodeTypes}
        />
        <div className="ml-auto pr-3">
          <GraphSearch nodes={simulationNodes} onSearchResults={setSearchMatchIds} />
        </div>
      </div>

      {/* SVG graph area */}
      <div ref={containerRef} className="relative flex-1 min-h-0 overflow-hidden bg-background">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        >
          {/* Background rect for click capture */}
          <rect
            className="graph-bg"
            width={dimensions.width}
            height={dimensions.height}
            fill="transparent"
          />

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* Edges */}
            <g className="edges">
              {simulationEdges.map((edge) => {
                const source = edge.source as SimulationNode;
                const target = edge.target as SimulationNode;
                if (!source.x || !source.y || !target.x || !target.y) return null;
                const style = EDGE_STYLES[edge.edgeType];
                const opacity = getEdgeOpacity(edge);

                return (
                  <g key={edge.id}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={style?.color ?? "#666"}
                      strokeWidth={style?.width ?? 1}
                      strokeDasharray={style?.dashArray}
                      opacity={opacity}
                      className="transition-opacity duration-200"
                    />
                    {showParticles && opacity > 0.1 && (
                      <circle
                        className="edge-particle"
                        r={PARTICLE_RADIUS}
                        fill={style?.color ?? "#666"}
                        opacity={opacity * 0.8}
                      />
                    )}
                  </g>
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {simulationNodes.map((node) => {
                if (node.x == null || node.y == null) return null;
                const radius = NODE_SIZES[node.nodeType] ?? 8;
                const color = NODE_COLORS[node.nodeType] ?? "#666";
                const opacity = getNodeOpacity(node.id);
                const isHovered = hoveredNode?.node.id === node.id;

                return (
                  <g
                    key={node.id}
                    className="transition-opacity duration-200"
                    style={{ opacity }}
                  >
                    {/* Glow ring on hover */}
                    {isHovered && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 6}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        opacity={0.4}
                      />
                    )}

                    <circle
                      className="node-circle"
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={color}
                      stroke={isHovered ? "#fff" : "transparent"}
                      strokeWidth={isHovered ? 2 : 0}
                      style={{ cursor: "pointer" }}
                      data-node-id={node.id}
                      onMouseEnter={(e) => {
                        const rect = svgRef.current?.getBoundingClientRect();
                        handleNodeHover(
                          node,
                          e.clientX - (rect?.left ?? 0),
                          e.clientY - (rect?.top ?? 0),
                        );
                      }}
                      onMouseLeave={() => handleNodeHover(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        interactionNodeClick(node);
                      }}
                    />

                    {/* Label */}
                    {showLabels && opacity > 0.3 && (
                      <text
                        x={node.x}
                        y={node.y + radius + 12}
                        textAnchor="middle"
                        fill="currentColor"
                        className="text-[10px] pointer-events-none select-none fill-foreground/70"
                      >
                        {node.label.length > 20
                          ? node.label.slice(0, 18) + "..."
                          : node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredNode && (
          <GraphTooltip
            node={hoveredNode.node}
            x={hoveredNode.x}
            y={hoveredNode.y}
            connectionCount={tooltipConnectionCount}
          />
        )}

        {/* Legend */}
        <GraphLegend stats={stats} activeTypes={activeNodeTypes} />
      </div>
    </div>
  );
}
