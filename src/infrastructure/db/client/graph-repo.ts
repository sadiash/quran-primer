/** Dexie-backed graph node and edge repositories */

import type { KnowledgeGraphPort } from "@/core/ports";
import type {
  GraphNode,
  GraphEdge,
  KnowledgeGraph,
  NodeType,
  EdgeType,
} from "@/core/types";
import { db } from "./schema";

export class DexieGraphRepository implements KnowledgeGraphPort {
  async getGraph(options?: {
    verseKey?: string;
    tag?: string;
    surahId?: number;
  }): Promise<KnowledgeGraph> {
    let nodes: GraphNode[];

    if (options?.verseKey) {
      const records = await db.graphNodes
        .where("verseKey")
        .equals(options.verseKey)
        .toArray();
      nodes = records.map(this.recordToNode);
    } else if (options?.surahId) {
      const records = await db.graphNodes
        .where("surahId")
        .equals(options.surahId)
        .toArray();
      nodes = records.map(this.recordToNode);
    } else {
      const records = await db.graphNodes.toArray();
      nodes = records.map(this.recordToNode);
    }

    // If filtering by tag, filter nodes with matching metadata
    if (options?.tag) {
      nodes = nodes.filter((node) => {
        if (node.nodeType === "theme") {
          return node.label.toLowerCase() === options.tag!.toLowerCase();
        }
        const tags = node.metadata?.tags;
        if (Array.isArray(tags)) {
          return tags.some(
            (t) =>
              typeof t === "string" &&
              t.toLowerCase() === options.tag!.toLowerCase(),
          );
        }
        return false;
      });
    }

    // Gather all node IDs, then fetch relevant edges
    const nodeIds = new Set(nodes.map((n) => n.id));
    const allEdges = await db.graphEdges.toArray();
    const edges = allEdges
      .filter((e) => nodeIds.has(e.sourceNodeId) || nodeIds.has(e.targetNodeId))
      .map(this.recordToEdge);

    return { nodes, edges };
  }

  async addNode(node: GraphNode): Promise<void> {
    await db.graphNodes.put({
      id: node.id,
      nodeType: node.nodeType,
      label: node.label,
      verseKey: node.verseKey,
      surahId: node.surahId,
      metadata: node.metadata ? JSON.stringify(node.metadata) : undefined,
      createdAt: node.createdAt,
    });
  }

  async addEdge(edge: GraphEdge): Promise<void> {
    await db.graphEdges.put({
      id: edge.id,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      edgeType: edge.edgeType,
      weight: edge.weight,
      createdAt: edge.createdAt,
    });
  }

  async removeNode(id: string): Promise<void> {
    await db.graphNodes.delete(id);
    // Also remove all edges connected to this node
    const edges = await db.graphEdges
      .where("sourceNodeId")
      .equals(id)
      .or("targetNodeId")
      .equals(id)
      .toArray();
    await db.graphEdges.bulkDelete(edges.map((e) => e.id));
  }

  async removeEdge(id: string): Promise<void> {
    await db.graphEdges.delete(id);
  }

  private recordToNode(record: {
    id: string;
    nodeType: string;
    label: string;
    verseKey?: string;
    surahId?: number;
    metadata?: string;
    createdAt: Date;
  }): GraphNode {
    return {
      id: record.id,
      nodeType: record.nodeType as NodeType,
      label: record.label,
      verseKey: record.verseKey,
      surahId: record.surahId,
      metadata: record.metadata ? JSON.parse(record.metadata) : undefined,
      createdAt: record.createdAt,
    };
  }

  private recordToEdge(record: {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: string;
    weight?: number;
    createdAt: Date;
  }): GraphEdge {
    return {
      id: record.id,
      sourceNodeId: record.sourceNodeId,
      targetNodeId: record.targetNodeId,
      edgeType: record.edgeType as EdgeType,
      weight: record.weight,
      createdAt: record.createdAt,
    };
  }
}
