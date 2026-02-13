"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVerseContext } from "@/presentation/hooks/use-verse-context";
import { useCrossReferences } from "@/presentation/hooks/api/use-cross-references";
import { Badge, Skeleton } from "@/presentation/components/ui";
import type { CrossScriptureCluster, ScriptureVerse } from "@/core/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatScriptureRef(verse: ScriptureVerse): string {
  if (verse.verseKey) return verse.verseKey;
  return `${verse.book} ${verse.chapter}:${verse.verse}`;
}

function sourceLabel(source: ScriptureVerse["source"]): string {
  switch (source) {
    case "quran":
      return "Quran";
    case "bible":
      return "Bible";
    case "torah":
      return "Torah";
    default:
      return source;
  }
}

function sourceBadgeVariant(
  source: ScriptureVerse["source"],
): "default" | "secondary" | "outline" {
  switch (source) {
    case "quran":
      return "default";
    case "bible":
      return "secondary";
    case "torah":
      return "outline";
    default:
      return "secondary";
  }
}

function similarityPercent(similarity: number): string {
  return `${Math.round(similarity * 100)}%`;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CrossReferencePanel() {
  const verseKey = useVerseContext();
  const { data: clusters = [], isLoading, error } = useCrossReferences(verseKey);

  if (!verseKey) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-muted-foreground">
        <BookOpen className="h-10 w-10 opacity-40" />
        <p className="text-sm">
          Select a verse to see cross-scripture references
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Cross-References for {verseKey}
      </h3>

      {isLoading && <CrossReferenceSkeleton />}

      {error && (
        <p className="text-sm text-destructive">
          Failed to load cross-references. Please try again.
        </p>
      )}

      {!isLoading && !error && clusters.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No cross-scripture references found for this verse.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {clusters.map((cluster) => (
          <ClusterCard
            key={cluster.id}
            cluster={cluster}
            verseKey={verseKey}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cluster Card
// ---------------------------------------------------------------------------

interface ClusterCardProps {
  cluster: CrossScriptureCluster;
  verseKey: string;
}

function ClusterCard({ cluster }: ClusterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const nonQuranVerses = cluster.verses.filter((v) => v.source !== "quran");
  const quranVerses = cluster.verses.filter((v) => v.source === "quran");

  return (
    <div className="rounded-lg border border-border">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-2 p-3 text-left transition-fast hover:bg-muted/30"
      >
        <div className="mt-0.5">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {cluster.summary}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {similarityPercent(cluster.similarity)} match
            </Badge>
            <span className="text-xs text-muted-foreground">
              {nonQuranVerses.length} cross-scripture reference
              {nonQuranVerses.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border/50 px-3 pb-3 pt-2">
          {quranVerses.length > 0 && (
            <div className="mb-3">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                Quran
              </p>
              {quranVerses.map((v, i) => (
                <VerseCard key={`quran-${i}`} verse={v} />
              ))}
            </div>
          )}

          {nonQuranVerses.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                Related Scriptures
              </p>
              <div className="flex flex-col gap-2">
                {nonQuranVerses.map((v, i) => (
                  <VerseCard key={`other-${i}`} verse={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Verse Card
// ---------------------------------------------------------------------------

function VerseCard({ verse }: { verse: ScriptureVerse }) {
  const [showFull, setShowFull] = useState(false);
  const isLong = verse.text.length > 150;

  return (
    <div className="rounded-md border border-border/50 p-2.5">
      <div className="mb-1 flex items-center gap-1.5">
        <Badge variant={sourceBadgeVariant(verse.source)} className="text-[10px]">
          {sourceLabel(verse.source)}
        </Badge>
        <span className="text-xs font-medium text-foreground">
          {formatScriptureRef(verse)}
        </span>
      </div>
      <p
        className={cn(
          "text-sm leading-relaxed text-muted-foreground",
          !showFull && isLong && "line-clamp-3",
        )}
      >
        {verse.text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setShowFull(!showFull)}
          className="mt-1 text-xs font-medium text-primary transition-fast hover:text-primary/80"
        >
          {showFull ? "Show less" : "Show full text"}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function CrossReferenceSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-border p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
