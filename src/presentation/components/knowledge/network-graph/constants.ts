/** Visual constants for the D3 force-directed network graph */

import type { NodeType, EdgeType } from "@/core/types";

// ── Node Colors ──────────────────────────────────────────────────────
export const NODE_COLORS: Record<NodeType, string> = {
  verse: "#3b82f6",       // blue-500
  hadith: "#f59e0b",      // amber-500
  note: "#22c55e",        // green-500
  bookmark: "#ef4444",    // red-500
  theme: "#14b8a6",       // teal-500
  surah: "#a855f7",       // purple-500
  concept: "#ec4899",     // pink-500
  "hadith-topic": "#f97316", // orange-500
};

// Dimmed versions for dark background
export const NODE_COLORS_DIM: Record<NodeType, string> = {
  verse: "#1d4ed8",
  hadith: "#d97706",
  note: "#16a34a",
  bookmark: "#dc2626",
  theme: "#0d9488",
  surah: "#9333ea",
  concept: "#db2777",
  "hadith-topic": "#ea580c",
};

// ── Node Sizes (radius) ─────────────────────────────────────────────
export const NODE_SIZES: Record<NodeType, number> = {
  concept: 12,
  surah: 12,
  theme: 10,
  note: 9,
  verse: 8,
  hadith: 7,
  "hadith-topic": 7,
  bookmark: 6,
};

// ── Node Labels ─────────────────────────────────────────────────────
export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  verse: "Verse",
  hadith: "Hadith",
  note: "Note",
  bookmark: "Bookmark",
  theme: "Theme",
  surah: "Surah",
  concept: "Concept",
  "hadith-topic": "Topic",
};

// ── Semantic Layers (Y-axis band anchors, top to bottom) ────────────
// Lower number = higher on screen
export const LAYER_ORDER: Record<NodeType, number> = {
  concept: 0,
  surah: 1,
  verse: 2,
  note: 3,
  hadith: 4,
  "hadith-topic": 5,
  theme: 6,
  bookmark: 2, // bookmarks co-locate with verses
};

export const LAYER_COUNT = 7;

// ── Edge Styles ─────────────────────────────────────────────────────
export interface EdgeStyle {
  color: string;
  width: number;
  dashArray?: string;
  opacity: number;
}

export const EDGE_STYLES: Record<EdgeType, EdgeStyle> = {
  references: { color: "#6b7280", width: 1.5, opacity: 0.4 },
  thematic: { color: "#14b8a6", width: 2, opacity: 0.5 },
  "user-linked": { color: "#8b5cf6", width: 1.5, opacity: 0.5 },
  "same-surah": { color: "#9ca3af", width: 1, dashArray: "4,4", opacity: 0.25 },
  "hadith-verse": { color: "#f59e0b", width: 1.5, opacity: 0.4 },
  "note-hadith": { color: "#22c55e", width: 1.5, opacity: 0.45 },
  "concept-verse": { color: "#ec4899", width: 1.5, opacity: 0.4 },
  "concept-related": { color: "#ec4899", width: 1, dashArray: "3,3", opacity: 0.3 },
  "hadith-topic-link": { color: "#f97316", width: 1, opacity: 0.35 },
};

// ── Force Simulation Parameters ─────────────────────────────────────
export const LINK_DISTANCES: Partial<Record<EdgeType, number>> = {
  thematic: 100,
  references: 80,
  "same-surah": 60,
  "hadith-verse": 90,
  "note-hadith": 70,
  "concept-verse": 85,
  "concept-related": 95,
  "hadith-topic-link": 75,
  "user-linked": 80,
};

export const FORCE_CONFIG = {
  chargeStrength: -150,
  collisionPadding: 4,
  layerStrength: 0.12,
  centerXStrength: 0.05,
  alphaDecay: 0.015,
  defaultLinkDistance: 80,
} as const;

// ── Zoom limits ─────────────────────────────────────────────────────
export const ZOOM_EXTENT: [number, number] = [0.1, 5];

// ── Particle animation ──────────────────────────────────────────────
export const PARTICLE_RADIUS = 2;
export const PARTICLE_SPEED = 0.005; // fraction of edge length per frame
