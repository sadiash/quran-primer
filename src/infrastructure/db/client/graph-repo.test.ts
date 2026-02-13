import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./schema";
import { DexieGraphRepository } from "./graph-repo";
import type { GraphNode, GraphEdge } from "@/core/types";

describe("DexieGraphRepository", () => {
  const repo = new DexieGraphRepository();

  beforeEach(async () => {
    await db.graphNodes.clear();
    await db.graphEdges.clear();
  });

  function makeNode(overrides: Partial<GraphNode> = {}): GraphNode {
    return {
      id: "node-1",
      nodeType: "verse",
      label: "2:247",
      verseKey: "2:247",
      surahId: 2,
      createdAt: new Date("2025-01-01"),
      ...overrides,
    };
  }

  function makeEdge(overrides: Partial<GraphEdge> = {}): GraphEdge {
    return {
      id: "edge-1",
      sourceNodeId: "node-1",
      targetNodeId: "node-2",
      edgeType: "references",
      weight: 1,
      createdAt: new Date("2025-01-01"),
      ...overrides,
    };
  }

  describe("addNode / getGraph", () => {
    it("adds a node and retrieves it via getGraph", async () => {
      await repo.addNode(makeNode());
      const graph = await repo.getGraph();
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0]?.label).toBe("2:247");
    });

    it("stores and retrieves metadata as JSON", async () => {
      await repo.addNode(
        makeNode({
          metadata: { bookmarkId: "bm-1", importance: "high" },
        }),
      );
      const graph = await repo.getGraph();
      expect(graph.nodes[0]?.metadata).toEqual({
        bookmarkId: "bm-1",
        importance: "high",
      });
    });

    it("filters nodes by verseKey", async () => {
      await repo.addNode(makeNode({ id: "n1", verseKey: "2:247" }));
      await repo.addNode(
        makeNode({ id: "n2", verseKey: "3:45", surahId: 3 }),
      );

      const graph = await repo.getGraph({ verseKey: "2:247" });
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0]?.verseKey).toBe("2:247");
    });

    it("filters nodes by surahId", async () => {
      await repo.addNode(makeNode({ id: "n1", surahId: 2 }));
      await repo.addNode(
        makeNode({ id: "n2", surahId: 3, verseKey: "3:45" }),
      );

      const graph = await repo.getGraph({ surahId: 2 });
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0]?.surahId).toBe(2);
    });
  });

  describe("addEdge", () => {
    it("adds an edge and retrieves it in the graph", async () => {
      await repo.addNode(makeNode({ id: "node-1" }));
      await repo.addNode(
        makeNode({ id: "node-2", verseKey: "2:248", label: "2:248" }),
      );
      await repo.addEdge(makeEdge());

      const graph = await repo.getGraph();
      expect(graph.edges).toHaveLength(1);
      expect(graph.edges[0]?.edgeType).toBe("references");
    });

    it("only returns edges connected to matching nodes", async () => {
      await repo.addNode(makeNode({ id: "node-1", surahId: 2 }));
      await repo.addNode(
        makeNode({ id: "node-2", surahId: 2, verseKey: "2:248" }),
      );
      await repo.addNode(
        makeNode({ id: "node-3", surahId: 3, verseKey: "3:1" }),
      );
      await repo.addEdge(
        makeEdge({
          id: "e1",
          sourceNodeId: "node-1",
          targetNodeId: "node-2",
        }),
      );
      await repo.addEdge(
        makeEdge({
          id: "e2",
          sourceNodeId: "node-2",
          targetNodeId: "node-3",
        }),
      );

      const graph = await repo.getGraph({ surahId: 3 });
      // node-3 is in surah 3, edge e2 connects node-2 → node-3
      expect(graph.nodes).toHaveLength(1);
      expect(graph.edges).toHaveLength(1);
      expect(graph.edges[0]?.id).toBe("e2");
    });
  });

  describe("removeNode", () => {
    it("removes a node", async () => {
      await repo.addNode(makeNode());
      await repo.removeNode("node-1");

      const graph = await repo.getGraph();
      expect(graph.nodes).toHaveLength(0);
    });

    it("removes connected edges when a node is removed", async () => {
      await repo.addNode(makeNode({ id: "node-1" }));
      await repo.addNode(
        makeNode({ id: "node-2", verseKey: "2:248", label: "2:248" }),
      );
      await repo.addEdge(makeEdge());

      await repo.removeNode("node-1");

      const graph = await repo.getGraph();
      expect(graph.edges).toHaveLength(0);
    });
  });

  describe("removeEdge", () => {
    it("removes an edge without affecting nodes", async () => {
      await repo.addNode(makeNode({ id: "node-1" }));
      await repo.addNode(
        makeNode({ id: "node-2", verseKey: "2:248", label: "2:248" }),
      );
      await repo.addEdge(makeEdge());

      await repo.removeEdge("edge-1");

      const graph = await repo.getGraph();
      expect(graph.nodes).toHaveLength(2);
      expect(graph.edges).toHaveLength(0);
    });
  });

  describe("upsert behavior", () => {
    it("addNode upserts existing nodes", async () => {
      await repo.addNode(makeNode({ label: "original" }));
      await repo.addNode(makeNode({ label: "updated" }));

      const graph = await repo.getGraph();
      expect(graph.nodes).toHaveLength(1);
      expect(graph.nodes[0]?.label).toBe("updated");
    });
  });
});
