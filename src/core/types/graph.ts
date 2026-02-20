/** Knowledge graph domain types */

export type NodeType =
  | "verse"
  | "note"
  | "bookmark"
  | "theme"
  | "surah"
  | "hadith"
  | "concept"
  | "hadith-topic";

export type EdgeType =
  | "references"
  | "thematic"
  | "user-linked"
  | "same-surah"
  | "hadith-verse"
  | "note-hadith"
  | "concept-verse"
  | "concept-related"
  | "hadith-topic-link";

export interface GraphNode {
  id: string;
  nodeType: NodeType;
  label: string;
  verseKey?: string;
  surahId?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: EdgeType;
  weight?: number;
  createdAt: Date;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** D3 simulation node — extends GraphNode with position/velocity fields */
export interface SimulationNode extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  layer?: number;
}

/** D3 simulation edge — source/target are resolved to SimulationNode refs by D3 */
export interface SimulationEdge extends GraphEdge {
  source: string | SimulationNode;
  target: string | SimulationNode;
}

/** Counts by node/edge type for the graph stats display */
export interface GraphStats {
  nodeCounts: Partial<Record<NodeType, number>>;
  edgeCounts: Partial<Record<EdgeType, number>>;
  totalNodes: number;
  totalEdges: number;
}
