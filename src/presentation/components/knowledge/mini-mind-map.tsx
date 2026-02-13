"use client";

import Link from "next/link";
import { Expand } from "lucide-react";
import { useKnowledgeGraph } from "@/presentation/hooks/use-knowledge-graph";
import { MindMapView } from "./mind-map-view";
import { Skeleton } from "@/presentation/components/ui";

export interface MiniMindMapProps {
  verseKey: string;
}

export function MiniMindMap({ verseKey }: MiniMindMapProps) {
  const { nodes, edges, isLoading } = useKnowledgeGraph({ verseKey });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border p-3">
        <Skeleton className="h-[180px] w-full rounded" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-border p-4 text-center">
        <p className="text-sm text-muted-foreground">No connections yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add notes or bookmarks to see connections here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="h-[200px]">
        <MindMapView
          nodes={nodes}
          edges={edges}
          minimal
          className="h-full w-full"
        />
      </div>
      <div className="flex justify-end border-t border-border px-2 py-1">
        <Link
          href={`/knowledge/mind-map?verse_key=${encodeURIComponent(verseKey)}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Expand className="h-3 w-3" />
          Expand
        </Link>
      </div>
    </div>
  );
}
