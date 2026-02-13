"use client";

import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { BookText, Search, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useFetch } from "@/presentation/hooks/use-fetch";
import type { Hadith } from "@/core/types";
import { cn } from "@/lib/utils";

function sanitize(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "b", "i", "em", "strong", "span"],
    ALLOWED_ATTR: ["class"],
  });
}

const COLLECTIONS = [
  { id: "bukhari", label: "Bukhari" },
  { id: "muslim", label: "Muslim" },
  { id: "abudawud", label: "Abu Dawud" },
  { id: "tirmidhi", label: "Tirmidhi" },
];

function gradeColor(grade: string | null): string {
  if (!grade) return "text-muted-foreground bg-muted";
  const lower = grade.toLowerCase();
  if (lower.includes("sahih")) return "text-green-700 bg-green-500/10 dark:text-green-400";
  if (lower.includes("hasan")) return "text-yellow-700 bg-yellow-500/10 dark:text-yellow-400";
  if (lower.includes("daif") || lower.includes("weak")) return "text-orange-700 bg-orange-500/10 dark:text-orange-400";
  return "text-muted-foreground bg-muted";
}

export function HadithSection() {
  const { focusedVerseKey } = usePanels();
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<string | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const searchTerm = query || focusedVerseKey || "";
  const params = new URLSearchParams();
  if (searchTerm) params.set("q", searchTerm);
  if (collection) params.set("collection", collection);

  const url = searchTerm ? `/api/v1/hadith?${params}` : null;
  const fetchKey = `${searchTerm}:${collection ?? "all"}`;
  const { data: hadiths, error, isLoading } = useFetch<Hadith[]>(url, fetchKey);

  const results = hadiths ?? [];

  if (!focusedVerseKey && !query) {
    return (
      <div className="flex items-center gap-2 px-4 py-4 text-muted-foreground/70">
        <BookText className="h-4 w-4 shrink-0" />
        <p className="text-xs">Select a verse or search for related hadith</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Search bar */}
      <div className="shrink-0 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hadith..."
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Collection filter */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setCollection(undefined)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-medium transition-fast",
              !collection
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-surface-hover",
            )}
          >
            All
          </button>
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCollection(c.id === collection ? undefined : c.id)}
              className={cn(
                "rounded-md px-2 py-1 text-[10px] font-medium transition-fast",
                c.id === collection
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-surface-hover",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {focusedVerseKey && (
        <p className="shrink-0 text-xs text-muted-foreground">
          {query ? "Searching" : "Related to"}{" "}
          <span className="font-mono text-foreground">{query || focusedVerseKey}</span>
          {!isLoading && results.length > 0 && (
            <span className="text-muted-foreground/70"> — {results.length} found</span>
          )}
        </p>
      )}

      {/* Results */}
      <div className="space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
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
            No hadiths found.
          </p>
        )}

        {results.map((h) => (
          <HadithCard
            key={h.id}
            hadith={h}
            expanded={expandedId === h.id}
            onToggle={() => setExpandedId(expandedId === h.id ? null : h.id)}
          />
        ))}
      </div>
    </div>
  );
}

function HadithCard({
  hadith,
  expanded,
  onToggle,
}: {
  hadith: Hadith;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sanitizedHtml = useMemo(() => sanitize(hadith.text), [hadith.text]);
  const preview = useMemo(() => {
    const plain = hadith.text.replace(/<[^>]+>/g, "");
    return plain.length > 120 ? plain.slice(0, 120) + "..." : plain;
  }, [hadith.text]);

  return (
    <div className="rounded-lg border border-border/50 bg-surface/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-2 p-2.5 text-left transition-fast hover:bg-surface-hover"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-primary bg-primary/10 capitalize">
              {hadith.collection}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              #{hadith.hadithNumber}
            </span>
            {hadith.grade && (
              <span className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-medium",
                gradeColor(hadith.grade),
              )}>
                {hadith.grade}
              </span>
            )}
          </div>

          {hadith.narratedBy && (
            <p className="text-[10px] text-muted-foreground mb-1">
              <span className="italic">{hadith.narratedBy}</span>
            </p>
          )}

          {!expanded && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {preview}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border/30 px-2.5 py-2.5 space-y-2">
          <div
            className="text-xs leading-relaxed text-foreground [&_b]:font-semibold [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
          <div className="flex items-center gap-1.5 pt-1 border-t border-border/20">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {hadith.collection}, Book {hadith.bookNumber}, Hadith {hadith.hadithNumber}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
