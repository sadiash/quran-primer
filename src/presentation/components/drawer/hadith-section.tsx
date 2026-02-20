"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BookText,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useFetch } from "@/presentation/hooks/use-fetch";
import type { Hadith } from "@/core/types";
import { cn } from "@/lib/utils";
import {
  COLLECTIONS,
  COLLECTION_META,
  GRADE_FILTERS,
  parseGrade,
  categorizeGrade,
  type GradeFilter,
} from "@/presentation/components/hadith/constants";
import { HadithCard } from "@/presentation/components/hadith/hadith-card";

interface ConceptSearchResult {
  concepts: string[];
  hadiths: Hadith[];
}

const EXAMPLE_SEARCHES = ["patience", "prayer", "charity", "fasting", "knowledge"];
const RECENT_SEARCHES_KEY = "hadith:recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const existing = getRecentSearches();
    const trimmed = query.trim();
    const updated = [trimmed, ...existing.filter((s) => s !== trimmed)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/* ─── Main section ─── */

export function HadithSection() {
  const { focusedVerseKey } = usePanels();
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<string | undefined>(undefined);
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  // Text search (only when user types a query)
  const searchParams = new URLSearchParams();
  if (query) searchParams.set("q", query);
  if (collection) searchParams.set("collection", collection);

  const searchUrl = query ? `/api/v1/hadith?${searchParams}` : null;
  const searchKey = `search:${query}:${collection ?? "all"}`;
  const { data: searchHadiths, error: searchError, isLoading: searchLoading } = useFetch<Hadith[]>(searchUrl, searchKey);

  // Related hadiths via ontology (when verse is focused and no query)
  const relatedUrl = !query && focusedVerseKey
    ? `/api/v1/hadith/related?verse=${focusedVerseKey}`
    : null;
  const relatedKey = `related:${focusedVerseKey ?? "none"}`;
  const { data: relatedHadiths, error: relatedError, isLoading: relatedLoading } = useFetch<Hadith[]>(relatedUrl, relatedKey);

  const isRelatedMode = !query && !!focusedVerseKey;
  const allResults = (isRelatedMode ? relatedHadiths : searchHadiths) ?? [];
  const error = isRelatedMode ? relatedError : searchError;
  const isLoading = isRelatedMode ? relatedLoading : searchLoading;

  // Client-side collection + grade filtering
  const filteredResults = useMemo(() => {
    let results = allResults;
    if (collection) {
      results = results.filter((h) => h.collection === collection);
    }
    if (gradeFilter !== "all") {
      results = results.filter((h) => {
        const parsed = parseGrade(h.grade);
        if (!parsed) return false;
        const cat = categorizeGrade(parsed.label);
        return cat === gradeFilter;
      });
    }
    return results;
  }, [allResults, collection, gradeFilter]);

  // Client-side pagination
  const visibleResults = useMemo(
    () => filteredResults.slice(0, visibleCount),
    [filteredResults, visibleCount],
  );
  const hasMore = filteredResults.length > visibleCount;

  // Grade filter counts (respect active collection filter)
  const collectionFiltered = useMemo(
    () => collection ? allResults.filter((h) => h.collection === collection) : allResults,
    [allResults, collection],
  );
  const gradeCounts = useMemo(() => {
    const counts: Record<GradeFilter, number> = { all: collectionFiltered.length, sahih: 0, hasan: 0, daif: 0 };
    for (const h of collectionFiltered) {
      const parsed = parseGrade(h.grade);
      if (!parsed) continue;
      const cat = categorizeGrade(parsed.label);
      if (cat === "sahih") counts.sahih++;
      else if (cat === "hasan") counts.hasan++;
      else if (cat === "daif" || cat === "fabricated") counts.daif++;
    }
    return counts;
  }, [collectionFiltered]);

  // Reset pagination when search changes
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setVisibleCount(10);
    setGradeFilter("all");
  }, []);

  const handleSubmitSearch = useCallback((term: string) => {
    if (term.trim()) {
      saveRecentSearch(term.trim());
    }
  }, []);

  const [recentSearches] = useState(getRecentSearches);
  const showEmptyState = !focusedVerseKey && !query;

  // Build exclude list from direct-link hadith IDs
  const excludeKeys = useMemo(
    () => allResults.map((h) => `${h.collection}-${h.hadithNumber}`).join(","),
    [allResults],
  );

  // Concept-based hadith search (only in related mode, after direct links load)
  const conceptUrl = isRelatedMode && !isLoading
    ? `/api/v1/hadith/concept-search?verse=${focusedVerseKey}${excludeKeys ? `&exclude=${excludeKeys}` : ""}`
    : null;
  const conceptKey = `concept:${focusedVerseKey ?? "none"}:${excludeKeys}`;
  const { data: conceptData, isLoading: conceptLoading } = useFetch<ConceptSearchResult>(conceptUrl, conceptKey);

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Search bar */}
      <div className="shrink-0 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitSearch(query);
            }}
            placeholder="Search hadith..."
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {query && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Collection filter chips */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => { setCollection(undefined); setVisibleCount(10); }}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-medium transition-fast",
              !collection
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-surface-hover",
            )}
          >
            All
          </button>
          {COLLECTIONS.map((c) => {
            const meta = COLLECTION_META[c.id];
            const isActive = c.id === collection;
            return (
              <button
                key={c.id}
                onClick={() => { setCollection(c.id === collection ? undefined : c.id); setVisibleCount(10); }}
                className={cn(
                  "rounded-md px-2 py-1 text-[10px] font-medium transition-fast",
                  isActive
                    ? meta?.badge ?? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-hover",
                )}
                style={isActive && meta ? { borderLeft: `2px solid ${meta.accentColor}` } : undefined}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Grade filter chips - only show when we have results */}
        {collectionFiltered.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {GRADE_FILTERS.map((g) => {
              const count = gradeCounts[g.id];
              const isActive = gradeFilter === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => { setGradeFilter(g.id === gradeFilter ? "all" : g.id); setVisibleCount(10); }}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-medium transition-fast inline-flex items-center gap-1",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-surface-hover",
                    isActive && g.id !== "all" && g.style,
                  )}
                >
                  {g.label}
                  {g.id !== "all" && count > 0 && (
                    <span className={cn(
                      "text-[9px] opacity-70",
                      isActive ? "" : "text-muted-foreground/50",
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Empty state: no query, no focused verse */}
      {showEmptyState && (
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-muted-foreground/70">
            <BookText className="h-4 w-4 shrink-0" />
            <p className="text-xs">Select a verse or search for related hadith</p>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Recent searches
              </p>
              <div className="flex flex-wrap gap-1">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => { handleSearch(s); handleSubmitSearch(s); }}
                    className="rounded-md bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Example searches */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Try searching for
            </p>
            <div className="flex flex-wrap gap-1">
              {EXAMPLE_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => { handleSearch(s); handleSubmitSearch(s); }}
                  className="rounded-md border border-border/50 px-2.5 py-1 text-[11px] text-muted-foreground/70 hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results header */}
      {!showEmptyState && query && (
        <div className="shrink-0 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Searching{" "}
            <span className="font-mono text-foreground">{query}</span>
            {!isLoading && collectionFiltered.length > 0 && (
              <span className="text-muted-foreground/70">
                {" "}&mdash;{" "}
                {gradeFilter !== "all" ? `${filteredResults.length} of ${collectionFiltered.length}` : collectionFiltered.length} found
              </span>
            )}
          </p>
        </div>
      )}

      {/* Linked to verse header (pill style) */}
      {!showEmptyState && isRelatedMode && !isLoading && collectionFiltered.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border/40" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 shrink-0">
            Linked to verse
          </p>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium leading-none"
            style={{ backgroundColor: "rgba(52,211,153,0.12)", color: "rgb(52,211,153)" }}
          >
            {focusedVerseKey}
          </span>
          <span className="text-[10px] text-muted-foreground/40">
            {gradeFilter !== "all" ? `${filteredResults.length}/${collectionFiltered.length}` : collectionFiltered.length}
          </span>
          <div className="h-px flex-1 bg-border/40" />
        </div>
      )}

      {/* Results */}
      <div className="space-y-1.5">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Searching...</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && !showEmptyState && visibleResults.length === 0 && (query || isRelatedMode) && (
          <div className="py-4 text-center space-y-2">
            <p className="text-xs text-muted-foreground/70 italic">
              {isRelatedMode
                ? `No linked hadiths for verse ${focusedVerseKey}`
                : "No hadiths found."}
            </p>
            {isRelatedMode && (
              <p className="text-[11px] text-muted-foreground/50">
                Try searching by keyword instead
              </p>
            )}
          </div>
        )}

        {visibleResults.map((h, i) => (
          <div key={`${h.collection}-${h.hadithNumber}`}>
            {i > 0 && <div className="mx-3 border-t border-border/30" />}
            <HadithCard
              hadith={h}
              expanded={expandedId === `${h.collection}-${h.hadithNumber}`}
              onToggle={() =>
                setExpandedId(
                  expandedId === `${h.collection}-${h.hadithNumber}`
                    ? null
                    : `${h.collection}-${h.hadithNumber}`,
                )
              }
            />
          </div>
        ))}

        {/* Show more button */}
        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + 10)}
            className="w-full rounded-lg border border-border/50 py-2 text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            Show more ({filteredResults.length - visibleResults.length} remaining)
          </button>
        )}
      </div>

      {/* Concept-based results (related mode only) */}
      {isRelatedMode && !isLoading && (
        <>
          {conceptLoading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/60" />
              <span className="text-[11px] text-muted-foreground/60">Finding related by concept...</span>
            </div>
          )}

          {conceptData && conceptData.hadiths.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-border/40" />
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 shrink-0">
                  Related by concept
                </p>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              {conceptData.concepts.length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {conceptData.concepts.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none"
                      style={{ backgroundColor: "rgba(99,102,241,0.12)", color: "rgb(129,140,248)" }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {conceptData.hadiths.map((h, i) => (
                <div key={`${h.collection}-${h.hadithNumber}`}>
                  {i > 0 && <div className="mx-3 border-t border-border/30" />}
                  <HadithCard
                    hadith={h}
                    expanded={expandedId === `${h.collection}-${h.hadithNumber}`}
                    onToggle={() =>
                      setExpandedId(
                        expandedId === `${h.collection}-${h.hadithNumber}`
                          ? null
                          : `${h.collection}-${h.hadithNumber}`,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
