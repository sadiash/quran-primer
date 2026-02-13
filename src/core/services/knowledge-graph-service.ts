/** KnowledgeGraphService — builds graphs from user data (bookmarks, notes) */

import type { BookmarkRepository, NoteRepository } from "@/core/ports";
import type {
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  Bookmark,
  Note,
} from "@/core/types";

export interface KnowledgeGraphServiceDeps {
  bookmarks: BookmarkRepository;
  notes: NoteRepository;
}

export interface GenerateGraphOptions {
  verseKey?: string;
  tag?: string;
  surahId?: number;
}

export class KnowledgeGraphService {
  private readonly deps: KnowledgeGraphServiceDeps;

  constructor(deps: KnowledgeGraphServiceDeps) {
    this.deps = deps;
  }

  /**
   * Generate a KnowledgeGraph from user data.
   * Nodes come from bookmarks (verse nodes), notes (note nodes), and unique tags (theme nodes).
   * Edges connect: notes to verses, bookmarks in the same surah, notes sharing tags.
   */
  async generateGraph(options?: GenerateGraphOptions): Promise<KnowledgeGraph> {
    const [bookmarks, notes] = await Promise.all([
      this.fetchBookmarks(options),
      this.fetchNotes(options),
    ]);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // 1. Build verse nodes from bookmarks
    for (const bm of bookmarks) {
      const nodeId = `verse:${bm.verseKey}`;
      if (!nodeMap.has(nodeId)) {
        const node: GraphNode = {
          id: nodeId,
          nodeType: "verse",
          label: bm.verseKey,
          verseKey: bm.verseKey,
          surahId: bm.surahId,
          metadata: { bookmarkId: bm.id, note: bm.note },
          createdAt: bm.createdAt,
        };
        nodeMap.set(nodeId, node);
        nodes.push(node);
      }
    }

    // 2. Build note nodes and verse nodes from notes
    for (const note of notes) {
      // Ensure a verse node exists for this note's verse
      const verseNodeId = `verse:${note.verseKey}`;
      if (!nodeMap.has(verseNodeId)) {
        const verseNode: GraphNode = {
          id: verseNodeId,
          nodeType: "verse",
          label: note.verseKey,
          verseKey: note.verseKey,
          surahId: note.surahId,
          createdAt: note.createdAt,
        };
        nodeMap.set(verseNodeId, verseNode);
        nodes.push(verseNode);
      }

      // Note node
      const noteNodeId = `note:${note.id}`;
      const noteNode: GraphNode = {
        id: noteNodeId,
        nodeType: "note",
        label: note.content.slice(0, 60) || "Note",
        verseKey: note.verseKey,
        surahId: note.surahId,
        metadata: { tags: note.tags },
        createdAt: note.createdAt,
      };
      nodeMap.set(noteNodeId, noteNode);
      nodes.push(noteNode);

      // Edge: note → verse (references)
      edges.push({
        id: `edge:ref:${note.id}:${note.verseKey}`,
        sourceNodeId: noteNodeId,
        targetNodeId: verseNodeId,
        edgeType: "references",
        weight: 1,
        createdAt: note.createdAt,
      });
    }

    // 3. Build theme nodes from unique tags
    const tagToNoteIds = new Map<string, string[]>();
    for (const note of notes) {
      for (const tag of note.tags) {
        const noteNodeId = `note:${note.id}`;
        const existing = tagToNoteIds.get(tag);
        if (existing) {
          existing.push(noteNodeId);
        } else {
          tagToNoteIds.set(tag, [noteNodeId]);
        }
      }
    }

    for (const [tag, noteNodeIds] of tagToNoteIds) {
      const themeNodeId = `theme:${tag}`;
      if (!nodeMap.has(themeNodeId)) {
        const themeNode: GraphNode = {
          id: themeNodeId,
          nodeType: "theme",
          label: tag,
          createdAt: new Date(),
        };
        nodeMap.set(themeNodeId, themeNode);
        nodes.push(themeNode);
      }

      // Thematic edges: connect notes sharing the same tag
      for (let i = 0; i < noteNodeIds.length; i++) {
        const noteNodeId = noteNodeIds[i]!;
        // Edge: note → theme
        edges.push({
          id: `edge:thematic:${noteNodeId}:${tag}`,
          sourceNodeId: noteNodeId,
          targetNodeId: themeNodeId,
          edgeType: "thematic",
          weight: 1,
          createdAt: new Date(),
        });
      }
    }

    // 4. Same-surah edges between bookmarked verses in the same surah
    const surahGroups = new Map<number, string[]>();
    for (const bm of bookmarks) {
      const nodeId = `verse:${bm.verseKey}`;
      const group = surahGroups.get(bm.surahId);
      if (group) {
        group.push(nodeId);
      } else {
        surahGroups.set(bm.surahId, [nodeId]);
      }
    }

    for (const [, verseNodeIds] of surahGroups) {
      for (let i = 0; i < verseNodeIds.length; i++) {
        for (let j = i + 1; j < verseNodeIds.length; j++) {
          const srcId = verseNodeIds[i]!;
          const tgtId = verseNodeIds[j]!;
          edges.push({
            id: `edge:same-surah:${srcId}:${tgtId}`,
            sourceNodeId: srcId,
            targetNodeId: tgtId,
            edgeType: "same-surah",
            weight: 0.5,
            createdAt: new Date(),
          });
        }
      }
    }

    // 5. Apply tag filter if specified
    if (options?.tag) {
      return this.filterByTag(nodes, edges, options.tag);
    }

    return { nodes, edges };
  }

  private async fetchBookmarks(options?: GenerateGraphOptions): Promise<Bookmark[]> {
    if (options?.verseKey) {
      const bm = await this.deps.bookmarks.getByVerseKey(options.verseKey);
      return bm ? [bm] : [];
    }
    if (options?.surahId) {
      return this.deps.bookmarks.getBySurah(options.surahId);
    }
    return this.deps.bookmarks.getAll();
  }

  private async fetchNotes(options?: GenerateGraphOptions): Promise<Note[]> {
    if (options?.verseKey) {
      return this.deps.notes.getByVerseKey(options.verseKey);
    }
    if (options?.tag) {
      return this.deps.notes.getByTag(options.tag);
    }
    if (options?.surahId) {
      return this.deps.notes.getBySurah(options.surahId);
    }
    return this.deps.notes.getAll();
  }

  /**
   * When filtering by tag, keep only nodes reachable from the tag's theme node,
   * and edges that connect those nodes.
   */
  private filterByTag(
    nodes: GraphNode[],
    edges: GraphEdge[],
    tag: string,
  ): KnowledgeGraph {
    const themeNodeId = `theme:${tag}`;

    // Collect all node IDs reachable from the theme node via edges
    const reachable = new Set<string>();
    reachable.add(themeNodeId);

    // BFS from the theme node
    const queue = [themeNodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const edge of edges) {
        if (edge.sourceNodeId === current && !reachable.has(edge.targetNodeId)) {
          reachable.add(edge.targetNodeId);
          queue.push(edge.targetNodeId);
        }
        if (edge.targetNodeId === current && !reachable.has(edge.sourceNodeId)) {
          reachable.add(edge.sourceNodeId);
          queue.push(edge.sourceNodeId);
        }
      }
    }

    const filteredNodes = nodes.filter((n) => reachable.has(n.id));
    const filteredEdges = edges.filter(
      (e) => reachable.has(e.sourceNodeId) && reachable.has(e.targetNodeId),
    );

    return { nodes: filteredNodes, edges: filteredEdges };
  }
}
