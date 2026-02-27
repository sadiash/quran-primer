"use client";

import { useState, useMemo, useCallback } from "react";
import { BookBookmarkIcon, CircleNotchIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { usePreferences } from "@/presentation/hooks/use-preferences";
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
  const { preferences } = usePreferences();
  const enabledCollections = useMemo(
    () => COLLECTIONS.filter((c) => preferences.activeHadithCollections.includes(c.id)),
    [preferences.activeHadithCollections],
  );
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
  const enabledIds = useMemo(() => new Set<string>(enabledCollections.map((c) => c.id)), [enabledCollections]);
  const filteredResults = useMemo(() => {
    // Only show hadiths from collections enabled in settings
    let results = allResults.filter((h) => enabledIds.has(h.collection));
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
          <MagnifyingGlassIcon weight="duotone" className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitSearch(query);
            }}
            placeholder="Search hadith..."
            className="w-full border-2 border-foreground/20 bg-background py-1.5 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
          {query && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <XIcon weight="bold" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Collection filter chips */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => { setCollection(undefined); setVisibleCount(10); }}
            className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
            style={!collection ? {
              backgroundColor: 'var(--highlight)',
              borderLeft: '3px solid #e8e337',
              color: 'var(--surah-yellow-label)',
            } : {
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            All
          </button>
          {enabledCollections.map((c) => {
            const meta = COLLECTION_META[c.id];
            const isActive = c.id === collection;
            return (
              <button
                key={c.id}
                onClick={() => { setCollection(c.id === collection ? undefined : c.id); setVisibleCount(10); }}
                className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
                style={isActive && meta ? {
                  backgroundColor: meta.bg,
                  borderLeft: `3px solid ${meta.accentColor}`,
                  color: meta.labelColor,
                } : {
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--muted-foreground))',
                }}
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
              const gradeColors: Record<string, { bg: string; border: string; label: string }> = {
                all: { bg: 'var(--surah-yellow-bg)', border: 'var(--surah-yellow-accent)', label: 'var(--surah-yellow-label)' },
                sahih: { bg: 'var(--surah-teal-bg)', border: 'var(--surah-teal-accent)', label: 'var(--surah-teal-label)' },
                hasan: { bg: 'var(--surah-yellow-bg)', border: 'var(--surah-yellow-accent)', label: 'var(--surah-yellow-label)' },
                daif: { bg: 'var(--surah-pink-bg)', border: 'var(--surah-pink-accent)', label: 'var(--surah-pink-label)' },
              };
              const colors = gradeColors[g.id] ?? gradeColors.all!;
              return (
                <button
                  key={g.id}
                  onClick={() => { setGradeFilter(g.id === gradeFilter ? "all" : g.id); setVisibleCount(10); }}
                  className="px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                  style={isActive ? {
                    backgroundColor: colors.bg,
                    borderLeft: `3px solid ${colors.border}`,
                    color: colors.label,
                  } : {
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                >
                  {g.label}
                  {g.id !== "all" && count > 0 && (
                    <span className="text-[9px] opacity-70">
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
            <BookBookmarkIcon weight="duotone" className="h-4 w-4 shrink-0" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider">Select a verse or search for related hadith</p>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-1.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                Recent searches
              </p>
              <div className="flex flex-wrap gap-1">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => { handleSearch(s); handleSubmitSearch(s); }}
                    className="border-2 border-foreground/20 bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Example searches */}
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
              Try searching for
            </p>
            <div className="flex flex-wrap gap-1">
              {EXAMPLE_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => { handleSearch(s); handleSubmitSearch(s); }}
                  className="border-2 border-border px-2.5 py-1 font-mono text-[10px] text-muted-foreground/70 hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
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

      {/* Linked to verse header */}
      {!showEmptyState && isRelatedMode && !isLoading && collectionFiltered.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-foreground/20" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 shrink-0">
            Linked to verse
          </p>
          <span
            className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-bold leading-none"
            style={{ backgroundColor: "var(--surah-teal-bg)", color: "var(--surah-teal-label)" }}
          >
            {focusedVerseKey}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/40">
            {gradeFilter !== "all" ? `${filteredResults.length}/${collectionFiltered.length}` : collectionFiltered.length}
          </span>
          <div className="h-px flex-1 bg-foreground/20" />
        </div>
      )}

      {/* Results */}
      <div className="space-y-1.5">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6">
            <CircleNotchIcon weight="bold" className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Searching...</span>
          </div>
        )}

        {error && (
          <div className="border-2 border-destructive bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && !showEmptyState && visibleResults.length === 0 && (query || isRelatedMode) && (
          <div className="py-4 text-center space-y-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              {isRelatedMode
                ? `No linked hadiths for verse ${focusedVerseKey}`
                : "No hadiths found."}
            </p>
            {isRelatedMode && (
              <p className="font-mono text-[10px] text-muted-foreground/50">
                Try searching by keyword instead
              </p>
            )}
          </div>
        )}

        {visibleResults.map((h, i) => (
          <div key={`${h.collection}-${h.hadithNumber}`}>
            {i > 0 && <div className="mx-3 border-t-2 border-foreground/10" />}
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
            className="w-full border border-border py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-highlight transition-colors"
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
              <CircleNotchIcon weight="bold" className="h-3.5 w-3.5 animate-spin text-muted-foreground/60" />
              <span className="font-mono text-[10px] text-muted-foreground/60">Finding related by concept...</span>
            </div>
          )}

          {conceptData && conceptData.hadiths.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 pt-2">
                <div className="h-px flex-1 bg-foreground/20" />
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 shrink-0">
                  Related by concept
                </p>
                <div className="h-px flex-1 bg-foreground/20" />
              </div>

              {conceptData.concepts.length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {conceptData.concepts.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider leading-none"
                      style={{ backgroundColor: "var(--surah-lavender-bg)", color: "var(--surah-lavender-label)" }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {conceptData.hadiths.map((h, i) => (
                <div key={`${h.collection}-${h.hadithNumber}`}>
                  {i > 0 && <div className="mx-3 border-t-2 border-foreground/10" />}
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
