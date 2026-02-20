"use client";

import { RotateCcw, Tag, Type, Zap } from "lucide-react";
import type { NodeType } from "@/core/types";
import { NODE_COLORS, NODE_TYPE_LABELS } from "./constants";

const ALL_NODE_TYPES: NodeType[] = [
  "verse",
  "note",
  "hadith",
  "concept",
  "theme",
  "hadith-topic",
  "bookmark",
  "surah",
];

interface GraphControlsProps {
  visibleTypes: Set<NodeType>;
  onToggleType: (type: NodeType) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showParticles: boolean;
  onToggleParticles: () => void;
  onResetView: () => void;
  // Ontology toggles
  includeOntologyHadiths: boolean;
  onToggleOntologyHadiths: () => void;
  includeQuranicConcepts: boolean;
  onToggleQuranicConcepts: () => void;
  includeHadithTopics: boolean;
  onToggleHadithTopics: () => void;
  // Tag filters
  allTags: string[];
  activeTag: string | null;
  onTagFilter: (tag: string | null) => void;
  // Active node types (types that actually have nodes)
  activeNodeTypes: Set<NodeType>;
}

export function GraphControls({
  visibleTypes,
  onToggleType,
  showLabels,
  onToggleLabels,
  showParticles,
  onToggleParticles,
  onResetView,
  includeOntologyHadiths,
  onToggleOntologyHadiths,
  includeQuranicConcepts,
  onToggleQuranicConcepts,
  includeHadithTopics,
  onToggleHadithTopics,
  allTags,
  activeTag,
  onTagFilter,
  activeNodeTypes,
}: GraphControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-card/80 backdrop-blur-sm border-b border-border text-xs">
      {/* Reset */}
      <button
        onClick={onResetView}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
        title="Reset view"
      >
        <RotateCcw className="size-3.5" />
        Reset
      </button>

      <div className="w-px h-4 bg-border" />

      {/* Labels toggle */}
      <button
        onClick={onToggleLabels}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          showLabels ? "bg-primary/15 text-primary" : "hover:bg-muted"
        }`}
      >
        <Type className="size-3.5" />
        Labels
      </button>

      {/* Particles toggle */}
      <button
        onClick={onToggleParticles}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          showParticles ? "bg-primary/15 text-primary" : "hover:bg-muted"
        }`}
      >
        <Zap className="size-3.5" />
        Particles
      </button>

      <div className="w-px h-4 bg-border" />

      {/* Node type filters */}
      {ALL_NODE_TYPES.filter((t) => activeNodeTypes.has(t)).map((type) => (
        <button
          key={type}
          onClick={() => onToggleType(type)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            visibleTypes.has(type) ? "bg-muted/60" : "opacity-40 hover:opacity-70"
          }`}
        >
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: NODE_COLORS[type] }}
          />
          {NODE_TYPE_LABELS[type]}
        </button>
      ))}

      <div className="w-px h-4 bg-border" />

      {/* Ontology enrichment toggles */}
      <span className="text-muted-foreground font-medium">Enrich:</span>
      <button
        onClick={onToggleQuranicConcepts}
        className={`px-2 py-1 rounded transition-colors ${
          includeQuranicConcepts
            ? "bg-pink-500/15 text-pink-500"
            : "hover:bg-muted text-muted-foreground"
        }`}
      >
        Concepts
      </button>
      <button
        onClick={onToggleOntologyHadiths}
        className={`px-2 py-1 rounded transition-colors ${
          includeOntologyHadiths
            ? "bg-amber-500/15 text-amber-500"
            : "hover:bg-muted text-muted-foreground"
        }`}
      >
        Hadiths
      </button>
      <button
        onClick={onToggleHadithTopics}
        className={`px-2 py-1 rounded transition-colors ${
          includeHadithTopics
            ? "bg-orange-500/15 text-orange-500"
            : "hover:bg-muted text-muted-foreground"
        }`}
      >
        Topics
      </button>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <>
          <div className="w-px h-4 bg-border" />
          <Tag className="size-3.5 text-muted-foreground" />
          <button
            onClick={() => onTagFilter(null)}
            className={`px-2 py-1 rounded transition-colors ${
              !activeTag ? "bg-primary/15 text-primary" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagFilter(tag)}
              className={`px-2 py-1 rounded transition-colors ${
                activeTag === tag
                  ? "bg-teal-500/15 text-teal-500"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
