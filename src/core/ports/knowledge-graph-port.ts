import type { GraphNode, GraphEdge, KnowledgeGraph } from "@/core/types";

/** Access to knowledge graph data */
export interface KnowledgeGraphPort {
  getGraph(options?: {
    verseKey?: string;
    tag?: string;
    surahId?: number;
  }): Promise<KnowledgeGraph>;
  addNode(node: GraphNode): Promise<void>;
  addEdge(edge: GraphEdge): Promise<void>;
  removeNode(id: string): Promise<void>;
  removeEdge(id: string): Promise<void>;
}
