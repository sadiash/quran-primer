/** Knowledge graph domain types */

export type NodeType = "verse" | "note" | "bookmark" | "theme" | "surah";
export type EdgeType = "references" | "thematic" | "user-linked" | "same-surah";

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
