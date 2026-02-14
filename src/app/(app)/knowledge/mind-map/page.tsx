"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Network, Tag, StickyNote, BookOpen, Loader2 } from "lucide-react";
import { Skeleton } from "@/presentation/components/ui";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { MindMapView } from "@/presentation/components/knowledge/mind-map-view";
import { useKnowledgeGraph } from "@/presentation/hooks/use-knowledge-graph";
import type { GraphNode } from "@/core/types";
import { cn } from "@/lib/utils";

function MindMapContent() {
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);
  const router = useRouter();

  const { nodes, edges, allTags, isLoading } = useKnowledgeGraph(
    tagFilter ? { tag: tagFilter } : undefined,
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.nodeType === "verse" && node.verseKey) {
        const surahId = node.verseKey.split(":")[0];
        router.push(`/surah/${surahId}`);
      } else if (node.nodeType === "note") {
        router.push("/notes");
      } else if (node.nodeType === "theme") {
        // Filter to this tag
        setTagFilter(node.label);
      }
    },
    [router],
  );

  const isEmpty = !isLoading && nodes.length === 0;

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pt-6 pb-4 sm:px-6">
        <PageHeader
          title="Mind Map"
          subtitle={
            isLoading
              ? "Loading..."
              : `${nodes.length} nodes, ${edges.length} connections`
          }
          icon={Network}
        />

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            <button
              onClick={() => setTagFilter(undefined)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-fast",
                tagFilter === undefined
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground",
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setTagFilter(tagFilter === tag ? undefined : tag)
                }
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-fast",
                  tagFilter === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                )}
              >
                <Tag className="h-3 w-3" />
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary/20 ring-1 ring-primary/50" />
            Verse
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded border border-border bg-card" />
            Note
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-5 rounded-full bg-primary/20 ring-2 ring-primary" />
            Theme
          </span>
        </div>
      </div>

      {/* Graph canvas */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Network className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-foreground">
                No connections yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Your mind map builds automatically from your bookmarks and notes.
                Start reading and adding notes to see your knowledge graph grow.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/surah/1")}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-fast"
              >
                <BookOpen className="h-4 w-4" />
                Start reading
              </button>
              <button
                onClick={() => router.push("/notes")}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-fast"
              >
                <StickyNote className="h-4 w-4" />
                Add notes
              </button>
            </div>
          </div>
        ) : (
          <MindMapView
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}

export default function MindMapPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <MindMapContent />
    </Suspense>
  );
}
