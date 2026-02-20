/** KnowledgeGraphService — builds graphs from user data (bookmarks, notes) */

import type { BookmarkRepository, NoteRepository } from "@/core/ports";
import type {
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  GraphStats,
  NodeType,
  EdgeType,
  Bookmark,
  Note,
  QuranicConcept,
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

/** Ontology data passed in for enrichment (fetched client-side by the hook) */
export interface OntologyEnrichment {
  /** Map of verseKey → hadith IDs from hadith-verses.json */
  hadithVerseMap?: Map<string, string[]>;
  /** Quranic concepts indexed by verse key */
  conceptsByVerse?: Map<string, QuranicConcept[]>;
  /** Map of hadithId → topic names from hadith-topics.json */
  hadithTopicMap?: Map<string, string[]>;
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
      // Note node — use first verseKey/surahId for graph positioning
      const noteNodeId = `note:${note.id}`;
      const firstVk = note.verseKeys[0];
      const firstSurahId = firstVk
        ? Number(firstVk.split(":")[0])
        : note.surahIds[0];
      const noteNode: GraphNode = {
        id: noteNodeId,
        nodeType: "note",
        label: note.content.slice(0, 60) || "Note",
        verseKey: firstVk,
        surahId: firstSurahId,
        metadata: { tags: note.tags },
        createdAt: note.createdAt,
      };
      nodeMap.set(noteNodeId, noteNode);
      nodes.push(noteNode);

      // Ensure verse nodes exist and create edges for each linked verse
      for (const vk of note.verseKeys) {
        const verseNodeId = `verse:${vk}`;
        if (!nodeMap.has(verseNodeId)) {
          const [s] = vk.split(":");
          const verseNode: GraphNode = {
            id: verseNodeId,
            nodeType: "verse",
            label: vk,
            verseKey: vk,
            surahId: Number(s),
            createdAt: note.createdAt,
          };
          nodeMap.set(verseNodeId, verseNode);
          nodes.push(verseNode);
        }

        edges.push({
          id: `edge:ref:${note.id}:${vk}`,
          sourceNodeId: noteNodeId,
          targetNodeId: verseNodeId,
          edgeType: "references",
          weight: 1,
          createdAt: note.createdAt,
        });
      }
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

    // 5. Tier 1 — hadith nodes from note linkedResources (always on)
    for (const note of notes) {
      if (!note.linkedResources) continue;
      const noteNodeId = `note:${note.id}`;
      for (const lr of note.linkedResources) {
        if (lr.type !== "hadith") continue;
        const hadithId =
          lr.metadata?.hadithId ??
          `${lr.metadata?.collection ?? "unknown"}-${lr.metadata?.hadithNumber ?? lr.label}`;
        const hadithNodeId = `hadith:${hadithId}`;
        if (!nodeMap.has(hadithNodeId)) {
          const hadithNode: GraphNode = {
            id: hadithNodeId,
            nodeType: "hadith",
            label: lr.label,
            metadata: {
              collection: lr.metadata?.collection,
              hadithNumber: lr.metadata?.hadithNumber,
              preview: lr.preview.slice(0, 120),
            },
            createdAt: note.createdAt,
          };
          nodeMap.set(hadithNodeId, hadithNode);
          nodes.push(hadithNode);
        }
        edges.push({
          id: `edge:note-hadith:${note.id}:${hadithId}`,
          sourceNodeId: noteNodeId,
          targetNodeId: hadithNodeId,
          edgeType: "note-hadith",
          weight: 1,
          createdAt: note.createdAt,
        });
      }
    }

    // 6. Apply tag filter if specified
    if (options?.tag) {
      return this.filterByTag(nodes, edges, options.tag);
    }

    return { nodes, edges };
  }

  /**
   * Enrich an existing graph with ontology data.
   * Called separately after generateGraph so ontology fetching is opt-in.
   */
  enrichWithOntology(
    graph: KnowledgeGraph,
    enrichment: OntologyEnrichment,
  ): KnowledgeGraph {
    const nodes = [...graph.nodes];
    const edges = [...graph.edges];
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    // Collect verse keys present in graph
    const verseKeys = new Set<string>();
    for (const n of nodes) {
      if (n.nodeType === "verse" && n.verseKey) verseKeys.add(n.verseKey);
    }

    // Collect hadith IDs present in graph
    const hadithIds = new Set<string>();
    for (const n of nodes) {
      if (n.nodeType === "hadith") hadithIds.add(n.id.replace("hadith:", ""));
    }

    // Tier 2 — Related Hadiths from ontology (verse → hadith edges)
    if (enrichment.hadithVerseMap) {
      for (const vk of verseKeys) {
        const hIds = enrichment.hadithVerseMap.get(vk);
        if (!hIds) continue;
        for (const hId of hIds) {
          const hadithNodeId = `hadith:${hId}`;
          if (!nodeMap.has(hadithNodeId)) {
            const hadithNode: GraphNode = {
              id: hadithNodeId,
              nodeType: "hadith",
              label: hId.replace(/^[A-Z]+-HD/, "").replace(/^0+/, "") || hId,
              metadata: { ontology: true },
              createdAt: new Date(),
            };
            nodeMap.set(hadithNodeId, hadithNode);
            nodes.push(hadithNode);
          }
          hadithIds.add(hId);
          edges.push({
            id: `edge:hadith-verse:${hId}:${vk}`,
            sourceNodeId: hadithNodeId,
            targetNodeId: `verse:${vk}`,
            edgeType: "hadith-verse",
            weight: 0.8,
            createdAt: new Date(),
          });
        }
      }
    }

    // Tier 3 — Quranic Concepts (verse → concept edges)
    if (enrichment.conceptsByVerse) {
      const conceptNodeMap = new Map<string, GraphNode>();
      for (const vk of verseKeys) {
        const concepts = enrichment.conceptsByVerse.get(vk);
        if (!concepts) continue;
        for (const concept of concepts) {
          const conceptNodeId = `concept:${concept.id}`;
          if (!nodeMap.has(conceptNodeId)) {
            const conceptNode: GraphNode = {
              id: conceptNodeId,
              nodeType: "concept",
              label: concept.id.replace(/_/g, " "),
              metadata: {
                definition: concept.definition?.slice(0, 120),
                subcategoryCount: concept.subcategories?.length ?? 0,
              },
              createdAt: new Date(),
            };
            nodeMap.set(conceptNodeId, conceptNode);
            conceptNodeMap.set(concept.id, conceptNode);
            nodes.push(conceptNode);
          }
          edges.push({
            id: `edge:concept-verse:${concept.id}:${vk}`,
            sourceNodeId: conceptNodeId,
            targetNodeId: `verse:${vk}`,
            edgeType: "concept-verse",
            weight: 0.7,
            createdAt: new Date(),
          });
        }
      }

      // concept-related edges between concepts that share the same verse
      const conceptIds = [...conceptNodeMap.keys()];
      for (let i = 0; i < conceptIds.length; i++) {
        const cA = conceptIds[i]!;
        for (let j = i + 1; j < conceptIds.length; j++) {
          const cB = conceptIds[j]!;
          // Check if they share any verse
          let shared = false;
          for (const vk of verseKeys) {
            const cs = enrichment.conceptsByVerse.get(vk);
            if (cs && cs.some((c) => c.id === cA) && cs.some((c) => c.id === cB)) {
              shared = true;
              break;
            }
          }
          if (shared) {
            edges.push({
              id: `edge:concept-related:${cA}:${cB}`,
              sourceNodeId: `concept:${cA}`,
              targetNodeId: `concept:${cB}`,
              edgeType: "concept-related",
              weight: 0.5,
              createdAt: new Date(),
            });
          }
        }
      }
    }

    // Tier 4 — Hadith Topics (hadith → topic edges)
    if (enrichment.hadithTopicMap) {
      for (const hId of hadithIds) {
        const topics = enrichment.hadithTopicMap.get(hId);
        if (!topics) continue;
        for (const topic of topics) {
          const topicNodeId = `hadith-topic:${topic}`;
          if (!nodeMap.has(topicNodeId)) {
            const topicNode: GraphNode = {
              id: topicNodeId,
              nodeType: "hadith-topic",
              label: topic,
              createdAt: new Date(),
            };
            nodeMap.set(topicNodeId, topicNode);
            nodes.push(topicNode);
          }
          edges.push({
            id: `edge:hadith-topic-link:${hId}:${topic}`,
            sourceNodeId: `hadith:${hId}`,
            targetNodeId: topicNodeId,
            edgeType: "hadith-topic-link",
            weight: 0.6,
            createdAt: new Date(),
          });
        }
      }
    }

    return { nodes, edges };
  }

  /** Compute stats from a graph */
  static computeStats(graph: KnowledgeGraph): GraphStats {
    const nodeCounts: Partial<Record<NodeType, number>> = {};
    for (const n of graph.nodes) {
      nodeCounts[n.nodeType] = (nodeCounts[n.nodeType] ?? 0) + 1;
    }
    const edgeCounts: Partial<Record<EdgeType, number>> = {};
    for (const e of graph.edges) {
      edgeCounts[e.edgeType] = (edgeCounts[e.edgeType] ?? 0) + 1;
    }
    return {
      nodeCounts,
      edgeCounts,
      totalNodes: graph.nodes.length,
      totalEdges: graph.edges.length,
    };
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
