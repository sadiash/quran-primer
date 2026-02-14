import { describe, it, expect, vi, beforeEach } from "vitest";
import { KnowledgeGraphService } from "./knowledge-graph-service";
import type { BookmarkRepository, NoteRepository } from "@/core/ports";
import type { Bookmark, Note } from "@/core/types";

function createMockBookmarkRepo(): BookmarkRepository {
  return {
    getAll: vi.fn().mockResolvedValue([]),
    getBySurah: vi.fn().mockResolvedValue([]),
    getByVerseKey: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockNoteRepo(): NoteRepository {
  return {
    getAll: vi.fn().mockResolvedValue([]),
    getBySurah: vi.fn().mockResolvedValue([]),
    getByVerseKey: vi.fn().mockResolvedValue([]),
    getByTag: vi.fn().mockResolvedValue([]),
    getForVerse: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  };
}

function makeBookmark(overrides: Partial<Bookmark> = {}): Bookmark {
  return {
    id: "bm-1",
    verseKey: "2:247",
    surahId: 2,
    note: "",
    createdAt: new Date("2025-01-01"),
    ...overrides,
  };
}

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    verseKeys: ["2:247"],
    surahIds: [2],
    content: "A reflection on sovereignty",
    tags: ["sovereignty", "history"],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
  };
}

describe("KnowledgeGraphService", () => {
  let bookmarkRepo: BookmarkRepository;
  let noteRepo: NoteRepository;
  let service: KnowledgeGraphService;

  beforeEach(() => {
    vi.clearAllMocks();
    bookmarkRepo = createMockBookmarkRepo();
    noteRepo = createMockNoteRepo();
    service = new KnowledgeGraphService({
      bookmarks: bookmarkRepo,
      notes: noteRepo,
    });
  });

  describe("generateGraph with no data", () => {
    it("returns empty graph when no bookmarks or notes exist", async () => {
      const graph = await service.generateGraph();

      expect(graph.nodes).toHaveLength(0);
      expect(graph.edges).toHaveLength(0);
    });
  });

  describe("generateGraph with bookmarks", () => {
    it("creates verse nodes from bookmarks", async () => {
      (bookmarkRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeBookmark({ id: "bm-1", verseKey: "2:247" }),
        makeBookmark({ id: "bm-2", verseKey: "2:255" }),
      ]);

      const graph = await service.generateGraph();

      expect(graph.nodes).toHaveLength(2);
      expect(graph.nodes.every((n) => n.nodeType === "verse")).toBe(true);
    });

    it("creates same-surah edges between bookmarks in the same surah", async () => {
      (bookmarkRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeBookmark({ id: "bm-1", verseKey: "2:247", surahId: 2 }),
        makeBookmark({ id: "bm-2", verseKey: "2:255", surahId: 2 }),
      ]);

      const graph = await service.generateGraph();

      const sameSurahEdges = graph.edges.filter(
        (e) => e.edgeType === "same-surah",
      );
      expect(sameSurahEdges).toHaveLength(1);
    });

    it("does not create same-surah edges between bookmarks in different surahs", async () => {
      (bookmarkRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeBookmark({ id: "bm-1", verseKey: "2:247", surahId: 2 }),
        makeBookmark({ id: "bm-2", verseKey: "3:45", surahId: 3 }),
      ]);

      const graph = await service.generateGraph();

      const sameSurahEdges = graph.edges.filter(
        (e) => e.edgeType === "same-surah",
      );
      expect(sameSurahEdges).toHaveLength(0);
    });

    it("deduplicates verse nodes when bookmark and note share a verseKey", async () => {
      (bookmarkRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeBookmark({ id: "bm-1", verseKey: "2:247" }),
      ]);
      (noteRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeNote({ id: "note-1", verseKeys: ["2:247"] }),
      ]);

      const graph = await service.generateGraph();

      const verseNodes = graph.nodes.filter((n) => n.nodeType === "verse");
      expect(verseNodes).toHaveLength(1);
    });
  });

  describe("generateGraph with notes", () => {
    it("creates note nodes and verse nodes from notes", async () => {
      (noteRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeNote({ id: "note-1", verseKeys: ["2:247"] }),
      ]);

      const graph = await service.generateGraph();

      const noteNodes = graph.nodes.filter((n) => n.nodeType === "note");
      const verseNodes = graph.nodes.filter((n) => n.nodeType === "verse");
      expect(noteNodes).toHaveLength(1);
      expect(verseNodes).toHaveLength(1);
    });

    it("creates references edges from notes to verses", async () => {
      (noteRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeNote({ id: "note-1", verseKeys: ["2:247"] }),
      ]);

      const graph = await service.generateGraph();

      const refEdges = graph.edges.filter((e) => e.edgeType === "references");
      expect(refEdges).toHaveLength(1);
      expect(refEdges[0]!.sourceNodeId).toBe("note:note-1");
      expect(refEdges[0]!.targetNodeId).toBe("verse:2:247");
    });

    it("creates theme nodes from unique tags", async () => {
      (noteRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeNote({
          id: "note-1",
          tags: ["sovereignty", "history"],
        }),
      ]);

      const graph = await service.generateGraph();

      const themeNodes = graph.nodes.filter((n) => n.nodeType === "theme");
      expect(themeNodes).toHaveLength(2);
      expect(themeNodes.map((n) => n.label).sort()).toEqual([
        "history",
        "sovereignty",
      ]);
    });

    it("creates thematic edges from notes to theme nodes", async () => {
      (noteRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeNote({ id: "note-1", tags: ["patience"] }),
        makeNote({ id: "note-2", verseKeys: ["3:186"], tags: ["patience"] }),
      ]);

      const graph = await service.generateGraph();

      const thematicEdges = graph.edges.filter(
        (e) => e.edgeType === "thematic",
      );
      expect(thematicEdges).toHaveLength(2);
      expect(
        thematicEdges.every((e) => e.targetNodeId === "theme:patience"),
      ).toBe(true);
    });
  });

  describe("generateGraph with filtering", () => {
    it("filters by verseKey", async () => {
      const bm = makeBookmark({ id: "bm-1", verseKey: "2:247" });
      (bookmarkRepo.getByVerseKey as ReturnType<typeof vi.fn>).mockResolvedValue(bm);
      (noteRepo.getByVerseKey as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeNote({ id: "note-1", verseKeys: ["2:247"] }),
      ]);

      const graph = await service.generateGraph({ verseKey: "2:247" });

      expect(bookmarkRepo.getByVerseKey).toHaveBeenCalledWith("2:247");
      expect(noteRepo.getByVerseKey).toHaveBeenCalledWith("2:247");
      expect(graph.nodes.length).toBeGreaterThan(0);
    });

    it("filters by surahId", async () => {
      (bookmarkRepo.getBySurah as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeBookmark({ id: "bm-1" }),
      ]);
      (noteRepo.getBySurah as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const graph = await service.generateGraph({ surahId: 2 });

      expect(bookmarkRepo.getBySurah).toHaveBeenCalledWith(2);
      expect(noteRepo.getBySurah).toHaveBeenCalledWith(2);
      expect(graph.nodes).toHaveLength(1);
    });

    it("filters by tag (notes fetched by tag, graph filtered to reachable)", async () => {
      (noteRepo.getByTag as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeNote({ id: "note-1", verseKeys: ["2:247"], tags: ["patience"] }),
      ]);

      const graph = await service.generateGraph({ tag: "patience" });

      expect(noteRepo.getByTag).toHaveBeenCalledWith("patience");

      // Should include: theme:patience, note:note-1, verse:2:247
      const themeNodes = graph.nodes.filter((n) => n.nodeType === "theme");
      expect(themeNodes).toHaveLength(1);
      expect(themeNodes[0]!.label).toBe("patience");

      const noteNodes = graph.nodes.filter((n) => n.nodeType === "note");
      expect(noteNodes).toHaveLength(1);

      const verseNodes = graph.nodes.filter((n) => n.nodeType === "verse");
      expect(verseNodes).toHaveLength(1);
    });

    it("returns empty graph when verseKey has no bookmark", async () => {
      (bookmarkRepo.getByVerseKey as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (noteRepo.getByVerseKey as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const graph = await service.generateGraph({ verseKey: "99:1" });

      expect(graph.nodes).toHaveLength(0);
      expect(graph.edges).toHaveLength(0);
    });
  });

  describe("complex graph", () => {
    it("builds a multi-node graph with all edge types", async () => {
      (bookmarkRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeBookmark({ id: "bm-1", verseKey: "2:247", surahId: 2 }),
        makeBookmark({ id: "bm-2", verseKey: "2:255", surahId: 2 }),
      ]);
      (noteRepo.getAll as ReturnType<typeof vi.fn>).mockResolvedValue([
        makeNote({
          id: "note-1",
          verseKeys: ["2:247"],
          tags: ["sovereignty"],
        }),
        makeNote({
          id: "note-2",
          verseKeys: ["2:255"],
          tags: ["sovereignty", "power"],
        }),
      ]);

      const graph = await service.generateGraph();

      // Verse nodes: 2:247, 2:255 (2)
      // Note nodes: note-1, note-2 (2)
      // Theme nodes: sovereignty, power (2)
      expect(graph.nodes).toHaveLength(6);

      // Reference edges: note-1→2:247, note-2→2:255 (2)
      // Thematic edges: note-1→sovereignty, note-2→sovereignty, note-2→power (3)
      // Same-surah edges: 2:247↔2:255 (1)
      const refEdges = graph.edges.filter((e) => e.edgeType === "references");
      const thematicEdges = graph.edges.filter(
        (e) => e.edgeType === "thematic",
      );
      const sameSurahEdges = graph.edges.filter(
        (e) => e.edgeType === "same-surah",
      );

      expect(refEdges).toHaveLength(2);
      expect(thematicEdges).toHaveLength(3);
      expect(sameSurahEdges).toHaveLength(1);
    });
  });
});
