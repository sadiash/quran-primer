"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brain, Filter, RefreshCw } from "lucide-react";
import { useKnowledgeGraph } from "@/presentation/hooks/use-knowledge-graph";
import type { UseKnowledgeGraphOptions } from "@/presentation/hooks/use-knowledge-graph";
import { MindMapView } from "@/presentation/components/knowledge/mind-map-view";
import { Button, Input, EmptyState, Skeleton } from "@/presentation/components/ui";

type FilterMode = "all" | "tag" | "surah" | "verse";

export default function MindMapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Brain className="h-8 w-8 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">Loading mind map...</p>
          </div>
        </div>
      }
    >
      <MindMapPageContent />
    </Suspense>
  );
}

function MindMapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill from URL search params
  const initialVerseKey = searchParams.get("verse_key") ?? "";
  const initialTag = searchParams.get("tag") ?? "";
  const initialSurahId = searchParams.get("surah_id") ?? "";

  const initialMode: FilterMode = initialVerseKey
    ? "verse"
    : initialTag
      ? "tag"
      : initialSurahId
        ? "surah"
        : "all";

  const [filterMode, setFilterMode] = useState<FilterMode>(initialMode);
  const [tagInput, setTagInput] = useState(initialTag);
  const [surahInput, setSurahInput] = useState(initialSurahId);
  const [verseInput, setVerseInput] = useState(initialVerseKey);

  const options: UseKnowledgeGraphOptions | undefined = (() => {
    switch (filterMode) {
      case "tag":
        return tagInput.trim() ? { tag: tagInput.trim() } : undefined;
      case "surah": {
        const surahId = Number(surahInput);
        return surahId > 0 && surahId <= 114 ? { surahId } : undefined;
      }
      case "verse":
        return verseInput.trim() ? { verseKey: verseInput.trim() } : undefined;
      default:
        return undefined;
    }
  })();

  const { nodes, edges, isLoading, error, refetch } = useKnowledgeGraph(options);

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      // Extract surah ID from verse nodes like "verse:2:255"
      if (nodeId.startsWith("verse:")) {
        const verseKey = nodeId.replace("verse:", "");
        const surahId = verseKey.split(":")[0];
        if (surahId) {
          router.push(`/surahs/${surahId}`);
        }
      }
    },
    [router],
  );

  const filterModes: { value: FilterMode; label: string }[] = [
    { value: "all", label: "All" },
    { value: "tag", label: "By Tag" },
    { value: "surah", label: "By Surah" },
    { value: "verse", label: "By Verse" },
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Mind Map</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          aria-label="Refresh graph"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-1">
          {filterModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setFilterMode(mode.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filterMode === mode.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Filter inputs */}
        {filterMode === "tag" && (
          <Input
            placeholder="Tag name (e.g., patience)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="ml-2 h-7 w-48 text-xs"
          />
        )}
        {filterMode === "surah" && (
          <Input
            placeholder="Surah number (1-114)"
            type="number"
            min={1}
            max={114}
            value={surahInput}
            onChange={(e) => setSurahInput(e.target.value)}
            className="ml-2 h-7 w-40 text-xs"
          />
        )}
        {filterMode === "verse" && (
          <Input
            placeholder="Verse key (e.g., 2:255)"
            value={verseInput}
            onChange={(e) => setVerseInput(e.target.value)}
            className="ml-2 h-7 w-40 text-xs"
          />
        )}
      </div>

      {/* Graph area */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-32 w-32 rounded-full" />
              <p className="text-sm text-muted-foreground">Loading graph...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              title="Failed to load graph"
              description="There was an error loading your knowledge graph. Please try again."
              action={
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            />
          </div>
        )}

        {!isLoading && !error && nodes.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              title="Your mind map grows as you study"
              description="Start by reading and noting what stands out. Your bookmarks, notes, and tags will appear here as connected nodes."
            />
          </div>
        )}

        {!isLoading && !error && nodes.length > 0 && (
          <MindMapView
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  );
}
