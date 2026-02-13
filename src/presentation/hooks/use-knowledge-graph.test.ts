import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  createMockGraphNode,
  createMockGraphEdge,
} from "@/test/helpers/mock-data";

const mockGenerateGraph = vi.fn().mockResolvedValue({ nodes: [], edges: [] });

vi.mock("@/core/services/knowledge-graph-service", () => ({
  KnowledgeGraphService: vi.fn(function (this: Record<string, unknown>) {
    this.generateGraph = mockGenerateGraph;
  }),
}));

vi.mock("@/infrastructure/db/client/bookmark-repo", () => ({
  DexieBookmarkRepository: vi.fn(),
}));

vi.mock("@/infrastructure/db/client/note-repo", () => ({
  DexieNoteRepository: vi.fn(),
}));

import { useKnowledgeGraph } from "./use-knowledge-graph";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useKnowledgeGraph", () => {
  it("returns empty arrays while loading", () => {
    mockGenerateGraph.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useKnowledgeGraph(), {
      wrapper: createWrapper(),
    });

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("fetches and transforms graph data", async () => {
    const mockNodes = [
      createMockGraphNode({
        id: "verse:2:255",
        nodeType: "verse",
        label: "2:255",
        verseKey: "2:255",
        surahId: 2,
      }),
      createMockGraphNode({
        id: "note:n1",
        nodeType: "note",
        label: "Ayatul Kursi reflection",
        verseKey: "2:255",
        surahId: 2,
      }),
      createMockGraphNode({
        id: "theme:protection",
        nodeType: "theme" as "verse",
        label: "protection",
      }),
    ];

    const mockEdges = [
      createMockGraphEdge({
        id: "edge:ref:n1:2:255",
        sourceNodeId: "note:n1",
        targetNodeId: "verse:2:255",
        edgeType: "references",
      }),
      createMockGraphEdge({
        id: "edge:thematic:note:n1:protection",
        sourceNodeId: "note:n1",
        targetNodeId: "theme:protection",
        edgeType: "thematic",
      }),
    ];

    mockGenerateGraph.mockResolvedValueOnce({
      nodes: mockNodes,
      edges: mockEdges,
    });

    const { result } = renderHook(() => useKnowledgeGraph(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nodes).toHaveLength(3);
    expect(result.current.edges).toHaveLength(2);

    // Verify node transformation
    const verseNode = result.current.nodes.find((n) => n.id === "verse:2:255");
    expect(verseNode).toBeDefined();
    expect(verseNode!.type).toBe("verse");
    expect(verseNode!.position).toBeDefined();
    expect(verseNode!.data.verseKey).toBe("2:255");

    const noteNode = result.current.nodes.find((n) => n.id === "note:n1");
    expect(noteNode).toBeDefined();
    expect(noteNode!.type).toBe("note");

    const themeNode = result.current.nodes.find(
      (n) => n.id === "theme:protection",
    );
    expect(themeNode).toBeDefined();
    expect(themeNode!.type).toBe("theme");

    // Verify edge transformation
    const refEdge = result.current.edges.find(
      (e) => e.id === "edge:ref:n1:2:255",
    );
    expect(refEdge).toBeDefined();
    expect(refEdge!.source).toBe("note:n1");
    expect(refEdge!.target).toBe("verse:2:255");
    expect(refEdge!.type).toBe("custom");
  });

  it("passes verseKey filter to service", async () => {
    mockGenerateGraph.mockResolvedValueOnce({ nodes: [], edges: [] });

    renderHook(() => useKnowledgeGraph({ verseKey: "2:255" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGenerateGraph).toHaveBeenCalledWith({
        verseKey: "2:255",
        tag: undefined,
        surahId: undefined,
      });
    });
  });

  it("passes tag filter to service", async () => {
    mockGenerateGraph.mockResolvedValueOnce({ nodes: [], edges: [] });

    renderHook(() => useKnowledgeGraph({ tag: "patience" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGenerateGraph).toHaveBeenCalledWith({
        verseKey: undefined,
        tag: "patience",
        surahId: undefined,
      });
    });
  });

  it("passes surahId filter to service", async () => {
    mockGenerateGraph.mockResolvedValueOnce({ nodes: [], edges: [] });

    renderHook(() => useKnowledgeGraph({ surahId: 2 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockGenerateGraph).toHaveBeenCalledWith({
        verseKey: undefined,
        tag: undefined,
        surahId: 2,
      });
    });
  });

  it("handles service error gracefully", async () => {
    mockGenerateGraph.mockRejectedValueOnce(new Error("Dexie failure"));

    const { result } = renderHook(() => useKnowledgeGraph(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });
});
