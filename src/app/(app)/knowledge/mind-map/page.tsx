"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookOpenIcon, CircleNotchIcon, GraphIcon, NoteIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/presentation/components/ui";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { NetworkGraph } from "@/presentation/components/knowledge";
import { useKnowledgeGraph } from "@/presentation/hooks/use-knowledge-graph";
import type { GraphNode } from "@/core/types";

function MindMapContent() {
  const router = useRouter();

  // Ontology toggles
  const [includeOntologyHadiths, setIncludeOntologyHadiths] = useState(false);
  const [includeQuranicConcepts, setIncludeQuranicConcepts] = useState(false);
  const [includeHadithTopics, setIncludeHadithTopics] = useState(false);

  const { nodes, edges, allTags, stats, isLoading } = useKnowledgeGraph({
    includeOntologyHadiths,
    includeQuranicConcepts,
    includeHadithTopics,
  });

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.nodeType === "verse" && node.verseKey) {
        const [surahId] = node.verseKey.split(":");
        router.push(`/surah/${surahId}?verse=${node.verseKey}`);
      } else if (node.nodeType === "note") {
        router.push(`/notes`);
      }
    },
    [router],
  );

  const isEmpty = !isLoading && nodes.length === 0;

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pt-6 pb-2 sm:px-6">
        <PageHeader
          title="Knowledge Graph"
          subtitle={
            isLoading
              ? "Loading..."
              : `${stats.totalNodes} nodes, ${stats.totalEdges} connections`
          }
          icon={GraphIcon}
        />
      </div>

      {/* Graph area */}
      <div className="relative flex-1 min-h-0">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <CircleNotchIcon className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <GraphIcon className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-foreground">
                No connections yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Your knowledge graph builds automatically from your bookmarks and notes.
                Start reading and adding notes to see your graph grow.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/surah/1")}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-fast"
              >
                <BookOpenIcon className="h-4 w-4" />
                Start reading
              </button>
              <button
                onClick={() => router.push("/notes")}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-fast"
              >
                <NoteIcon className="h-4 w-4" />
                Add notes
              </button>
            </div>
          </div>
        ) : (
          <NetworkGraph
            nodes={nodes}
            edges={edges}
            stats={stats}
            allTags={allTags}
            onNodeClick={handleNodeClick}
            className="h-full"
            includeOntologyHadiths={includeOntologyHadiths}
            onToggleOntologyHadiths={() => setIncludeOntologyHadiths((v) => !v)}
            includeQuranicConcepts={includeQuranicConcepts}
            onToggleQuranicConcepts={() => setIncludeQuranicConcepts((v) => !v)}
            includeHadithTopics={includeHadithTopics}
            onToggleHadithTopics={() => setIncludeHadithTopics((v) => !v)}
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
