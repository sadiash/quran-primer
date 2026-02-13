"use client";

import { GitBranch, ExternalLink } from "lucide-react";
import { useWorkspace } from "@/presentation/providers";
import { useFetch } from "@/presentation/hooks/use-fetch";
import type { CrossScriptureCluster, ScriptureVerse } from "@/core/types";
import { cn } from "@/lib/utils";

function verseRef(v: ScriptureVerse): string {
  if (v.verseKey) return v.verseKey;
  return `${v.book} ${v.chapter}:${v.verse}`;
}

export function CrossRefPanel() {
  const { state, focusVerse } = useWorkspace();
  const verseKey = state.focusedVerseKey;

  const url = verseKey ? `/api/v1/cross-references?verse_key=${verseKey}` : null;
  const { data: clusters, error, isLoading } = useFetch<CrossScriptureCluster[]>(url, verseKey ?? "");

  const results = clusters ?? [];

  if (!verseKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-4">
        <GitBranch className="h-8 w-8 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No verse selected</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Select a verse to view cross-references
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Cross-references for <span className="font-mono text-foreground">{verseKey}</span>
      </p>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && results.length === 0 && (
        <p className="text-xs text-muted-foreground/70 italic py-4 text-center">
          No cross-references found for this verse.
        </p>
      )}

      {!isLoading && !error && results.length > 0 && (
        <div className="space-y-3">
          {results.map((cluster) => (
            <div
              key={cluster.id}
              className="rounded-lg border border-border/50 bg-surface/50 p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">
                  {cluster.summary}
                </p>
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  cluster.similarity >= 0.8
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : cluster.similarity >= 0.5
                      ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                      : "bg-muted text-muted-foreground",
                )}>
                  {Math.round(cluster.similarity * 100)}%
                </span>
              </div>
              <div className="space-y-1.5">
                {cluster.verses.map((v) => {
                  const ref = verseRef(v);
                  return (
                    <button
                      key={`${v.source}-${ref}`}
                      onClick={() => {
                        if (v.source === "quran" && v.verseKey) {
                          focusVerse(v.verseKey);
                        }
                      }}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-fast hover:bg-surface-hover"
                    >
                      <span className="mt-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase shrink-0">
                        {v.source}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground font-mono">{ref}</p>
                        {v.text && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">
                            {v.text}
                          </p>
                        )}
                      </div>
                      {v.source === "quran" && v.verseKey && (
                        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
