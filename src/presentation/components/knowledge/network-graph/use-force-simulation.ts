"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
} from "d3-force";
import type { GraphNode, GraphEdge, SimulationNode, SimulationEdge } from "@/core/types";
import {
  NODE_SIZES,
  LAYER_ORDER,
  LAYER_COUNT,
  LINK_DISTANCES,
  FORCE_CONFIG,
} from "./constants";

interface UseForceSimulationOptions {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  enabled?: boolean;
}

interface UseForceSimulationResult {
  simulationNodes: SimulationNode[];
  simulationEdges: SimulationEdge[];
  simulation: Simulation<SimulationNode, SimulationLinkDatum<SimulationNode>> | null;
  isStabilized: boolean;
  reheat: () => void;
}

export function useForceSimulation({
  nodes,
  edges,
  width,
  height,
  enabled = true,
}: UseForceSimulationOptions): UseForceSimulationResult {
  const [simulationNodes, setSimulationNodes] = useState<SimulationNode[]>([]);
  const [simulationEdges, setSimulationEdges] = useState<SimulationEdge[]>([]);
  const [isStabilized, setIsStabilized] = useState(false);

  const simulationRef = useRef<Simulation<
    SimulationNode,
    SimulationLinkDatum<SimulationNode>
  > | null>(null);
  const prevNodeIdsRef = useRef<string>("");

  const reheat = useCallback(() => {
    if (simulationRef.current) {
      setIsStabilized(false);
      simulationRef.current.alpha(0.8).restart();
    }
  }, []);

  useEffect(() => {
    if (!enabled || !width || !height || nodes.length === 0) {
      setSimulationNodes([]);
      setSimulationEdges([]);
      return;
    }

    // Detect if only node positions need updating vs full rebuild
    const nodeIds = nodes.map((n) => n.id).sort().join(",");
    const needsRebuild = nodeIds !== prevNodeIdsRef.current;
    prevNodeIdsRef.current = nodeIds;

    // Create simulation nodes, preserving positions if possible
    const prevPositions = new Map<string, { x: number; y: number }>();
    if (!needsRebuild) {
      for (const sn of simulationRef.current?.nodes() ?? []) {
        if (sn.x != null && sn.y != null) {
          prevPositions.set(sn.id, { x: sn.x, y: sn.y });
        }
      }
    }

    const simNodes: SimulationNode[] = nodes.map((n) => {
      const prev = prevPositions.get(n.id);
      const layerBand = height / LAYER_COUNT;
      const layer = LAYER_ORDER[n.nodeType] ?? 3;
      return {
        ...n,
        x: prev?.x ?? width / 2 + (Math.random() - 0.5) * width * 0.6,
        y: prev?.y ?? layer * layerBand + (Math.random() - 0.5) * layerBand * 0.5,
        layer,
      };
    });

    const nodeIdSet = new Set(simNodes.map((n) => n.id));
    const simEdges: SimulationEdge[] = edges
      .filter((e) => nodeIdSet.has(e.sourceNodeId) && nodeIdSet.has(e.targetNodeId))
      .map((e) => ({
        ...e,
        source: e.sourceNodeId,
        target: e.targetNodeId,
      }));

    // Stop old simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    setIsStabilized(false);

    const layerBand = height / LAYER_COUNT;

    const sim = forceSimulation<SimulationNode>(simNodes)
      .force(
        "link",
        forceLink<SimulationNode, SimulationEdge>(simEdges)
          .id((d) => d.id)
          .distance((d) => {
            const edgeType = (d as SimulationEdge).edgeType;
            return LINK_DISTANCES[edgeType] ?? FORCE_CONFIG.defaultLinkDistance;
          }),
      )
      .force(
        "charge",
        forceManyBody<SimulationNode>().strength(FORCE_CONFIG.chargeStrength),
      )
      .force(
        "collide",
        forceCollide<SimulationNode>().radius(
          (d) => (NODE_SIZES[d.nodeType] ?? 8) + FORCE_CONFIG.collisionPadding,
        ),
      )
      .force(
        "y",
        forceY<SimulationNode>()
          .y((d) => (d.layer ?? 3) * layerBand + layerBand / 2)
          .strength(FORCE_CONFIG.layerStrength),
      )
      .force(
        "x",
        forceX<SimulationNode>(width / 2).strength(FORCE_CONFIG.centerXStrength),
      )
      .alphaDecay(FORCE_CONFIG.alphaDecay)
      .on("tick", () => {
        setSimulationNodes([...sim.nodes()]);
        setSimulationEdges([...simEdges]);
      })
      .on("end", () => {
        setIsStabilized(true);
      });

    simulationRef.current = sim;

    return () => {
      sim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, width, height, enabled]);

  return {
    simulationNodes,
    simulationEdges,
    simulation: simulationRef.current,
    isStabilized,
    reheat,
  };
}
