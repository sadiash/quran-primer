"use client";

import { useState, useMemo, useCallback } from "react";
import DOMPurify from "dompurify";
import {
  BookText,
  Search,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  X,
  Library,
  ArrowLeft,
  Loader2,
  StickyNote,
} from "lucide-react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useToast } from "@/presentation/components/ui/toast";
import { useFetch } from "@/presentation/hooks/use-fetch";
import { db } from "@/infrastructure/db/client";
import type { Hadith, HadithBook } from "@/core/types";
import type { LinkedResource } from "@/core/types/study";

interface ConceptSearchResult {
  concepts: string[];
  hadiths: Hadith[];
}
import { cn } from "@/lib/utils";
import { PanelBreadcrumb, type BreadcrumbItem } from "@/presentation/components/panels/panel-breadcrumb";

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
  { id: "nasai", label: "Nasa'i" },
  { id: "ibnmajah", label: "Ibn Majah" },
];

/** Display-friendly collection names + colors (inline styles for border to avoid Tailwind purge) */
const COLLECTION_META: Record<string, { name: string; accentColor: string; badge: string }> = {
  bukhari: { name: "Sahih al-Bukhari", accentColor: "#34d399", badge: "bg-emerald-500/15 text-emerald-400" },
  muslim: { name: "Sahih Muslim", accentColor: "#2dd4bf", badge: "bg-teal-500/15 text-teal-400" },
  abudawud: { name: "Sunan Abu Dawud", accentColor: "#38bdf8", badge: "bg-sky-500/15 text-sky-400" },
  tirmidhi: { name: "Jami at-Tirmidhi", accentColor: "#a78bfa", badge: "bg-violet-500/15 text-violet-400" },
  nasai: { name: "Sunan an-Nasa'i", accentColor: "#fb7185", badge: "bg-rose-500/15 text-rose-400" },
  ibnmajah: { name: "Sunan Ibn Majah", accentColor: "#fbbf24", badge: "bg-amber-500/15 text-amber-400" },
};

/* ─── Grade helpers ─── */

interface ParsedGrade {
  label: string;
  grader: string | null;
}

function parseGrade(raw: string | null): ParsedGrade | null {
  if (!raw) return null;
  const m = raw.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m && m[1] && m[2]) return { label: m[1].trim(), grader: m[2].trim() };
  return { label: raw.trim(), grader: null };
}

type GradeCategory = "sahih" | "hasan" | "daif" | "fabricated" | "unknown";

function categorizeGrade(label: string): GradeCategory {
  const lower = label.toLowerCase();
  if (lower.includes("maudu") || lower.includes("mawdu") || lower.includes("fabricat") || lower.includes("munkar"))
    return "fabricated";
  if (lower.includes("da'if") || lower.includes("daif") || lower.includes("da if") || lower.includes("da,if") || lower.includes("da`if") || lower.includes("weak"))
    return "daif";
  if (lower.includes("hasan")) return "hasan";
  if (lower.includes("sahih") || lower.includes("sah,")) return "sahih";
  return "unknown";
}

const GRADE_STYLES: Record<GradeCategory, string> = {
  sahih: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10",
  hasan: "text-amber-700 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/10",
  daif: "text-orange-700 bg-orange-500/10 dark:text-orange-400 dark:bg-orange-500/10",
  fabricated: "text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-500/10",
  unknown: "text-muted-foreground bg-muted",
};

type GradeFilter = "all" | "sahih" | "hasan" | "daif";

const GRADE_FILTERS: { id: GradeFilter; label: string; style: string }[] = [
  { id: "all", label: "All Grades", style: "" },
  { id: "sahih", label: "Sahih", style: "text-emerald-700 dark:text-emerald-400" },
  { id: "hasan", label: "Hasan", style: "text-amber-700 dark:text-amber-400" },
  { id: "daif", label: "Da'if", style: "text-orange-700 dark:text-orange-400" },
];

type TabMode = "search" | "browse";

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
  const [tabMode, setTabMode] = useState<TabMode>("search");
  const [visibleCount, setVisibleCount] = useState(10);

  // Text search (only when user types a query)
  const searchParams = new URLSearchParams();
  if (query) searchParams.set("q", query);
  if (collection) searchParams.set("collection", collection);

  const searchUrl = tabMode === "search" && query ? `/api/v1/hadith?${searchParams}` : null;
  const searchKey = `search:${query}:${collection ?? "all"}`;
  const { data: searchHadiths, error: searchError, isLoading: searchLoading } = useFetch<Hadith[]>(searchUrl, searchKey);

  // Related hadiths via ontology (when verse is focused and no query)
  const relatedUrl = tabMode === "search" && !query && focusedVerseKey
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

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Tab toggle: Search | Browse */}
      <div className="flex shrink-0 rounded-lg bg-muted/50 p-0.5">
        <button
          onClick={() => setTabMode("search")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            tabMode === "search"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Search className="h-3 w-3" />
          Search
        </button>
        <button
          onClick={() => setTabMode("browse")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            tabMode === "browse"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Library className="h-3 w-3" />
          Browse
        </button>
      </div>

      {tabMode === "search" ? (
        <SearchMode
          query={query}
          setQuery={handleSearch}
          onSubmit={handleSubmitSearch}
          collection={collection}
          setCollection={(c) => { setCollection(c); setVisibleCount(10); }}
          gradeFilter={gradeFilter}
          setGradeFilter={(g) => { setGradeFilter(g); setVisibleCount(10); }}
          gradeCounts={gradeCounts}
          results={visibleResults}
          totalFiltered={filteredResults.length}
          totalAll={collectionFiltered.length}
          hasMore={hasMore}
          onShowMore={() => setVisibleCount((c) => c + 10)}
          isLoading={isLoading}
          error={error}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          focusedVerseKey={focusedVerseKey}
          isRelatedMode={isRelatedMode}
        />
      ) : (
        <BrowseMode
          expandedId={expandedId}
          setExpandedId={setExpandedId}
        />
      )}
    </div>
  );
}

/* ─── Search Mode ─── */

function SearchMode({
  query,
  setQuery,
  onSubmit,
  collection,
  setCollection,
  gradeFilter,
  setGradeFilter,
  gradeCounts,
  results,
  totalFiltered,
  totalAll,
  hasMore,
  onShowMore,
  isLoading,
  error,
  expandedId,
  setExpandedId,
  focusedVerseKey,
  isRelatedMode,
}: {
  query: string;
  setQuery: (q: string) => void;
  onSubmit: (q: string) => void;
  collection: string | undefined;
  setCollection: (c: string | undefined) => void;
  gradeFilter: GradeFilter;
  setGradeFilter: (g: GradeFilter) => void;
  gradeCounts: Record<GradeFilter, number>;
  results: Hadith[];
  totalFiltered: number;
  totalAll: number;
  hasMore: boolean;
  onShowMore: () => void;
  isLoading: boolean;
  error: string | null;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  focusedVerseKey: string | null;
  isRelatedMode: boolean;
}) {
  const [recentSearches] = useState(getRecentSearches);
  const showEmptyState = !focusedVerseKey && !query;

  // Build exclude list from direct-link hadith IDs
  const excludeKeys = useMemo(
    () => results.map((h) => `${h.collection}-${h.hadithNumber}`).join(","),
    [results],
  );

  // Concept-based hadith search (only in related mode, after direct links load)
  const conceptUrl = isRelatedMode && !isLoading
    ? `/api/v1/hadith/concept-search?verse=${focusedVerseKey}${excludeKeys ? `&exclude=${excludeKeys}` : ""}`
    : null;
  const conceptKey = `concept:${focusedVerseKey ?? "none"}:${excludeKeys}`;
  const { data: conceptData, isLoading: conceptLoading } = useFetch<ConceptSearchResult>(conceptUrl, conceptKey);

  return (
    <>
      {/* Search bar */}
      <div className="shrink-0 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit(query);
            }}
            placeholder="Search hadith..."
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Collection filter chips */}
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
          {COLLECTIONS.map((c) => {
            const meta = COLLECTION_META[c.id];
            const isActive = c.id === collection;
            return (
              <button
                key={c.id}
                onClick={() => setCollection(c.id === collection ? undefined : c.id)}
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
        {totalAll > 0 && (
          <div className="flex flex-wrap gap-1">
            {GRADE_FILTERS.map((g) => {
              const count = gradeCounts[g.id];
              const isActive = gradeFilter === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGradeFilter(g.id === gradeFilter ? "all" : g.id)}
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
                    onClick={() => { setQuery(s); onSubmit(s); }}
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
                  onClick={() => { setQuery(s); onSubmit(s); }}
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
            {!isLoading && totalAll > 0 && (
              <span className="text-muted-foreground/70">
                {" "}&mdash;{" "}
                {gradeFilter !== "all" ? `${totalFiltered} of ${totalAll}` : totalAll} found
              </span>
            )}
          </p>
        </div>
      )}

      {/* Linked to verse header (pill style) */}
      {!showEmptyState && isRelatedMode && !isLoading && totalAll > 0 && (
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
            {gradeFilter !== "all" ? `${totalFiltered}/${totalAll}` : totalAll}
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

        {!isLoading && !error && !showEmptyState && results.length === 0 && (query || isRelatedMode) && (
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

        {results.map((h, i) => (
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
            onClick={onShowMore}
            className="w-full rounded-lg border border-border/50 py-2 text-xs font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            Show more ({totalFiltered - results.length} remaining)
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
    </>
  );
}

/* ─── Browse Mode ─── */

function BrowseMode({
  expandedId,
  setExpandedId,
}: {
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}) {
  const [browseCollection, setBrowseCollection] = useState("bukhari");
  const [selectedBook, setSelectedBook] = useState<number | null>(null);

  // Load books for selected collection
  const booksUrl = `/api/v1/hadith/browse?collection=${browseCollection}`;
  const booksKey = `browse:books:${browseCollection}`;
  const { data: books, isLoading: booksLoading } = useFetch<HadithBook[]>(booksUrl, booksKey);

  // Load hadiths for selected book
  const hadithsUrl = selectedBook !== null
    ? `/api/v1/hadith/browse?collection=${browseCollection}&book=${selectedBook}`
    : null;
  const hadithsKey = `browse:hadiths:${browseCollection}:${selectedBook ?? "none"}`;
  const { data: bookHadiths, isLoading: hadithsLoading } = useFetch<Hadith[]>(hadithsUrl, hadithsKey);

  const selectedBookData = useMemo(
    () => books?.find((b) => b.bookNumber === selectedBook),
    [books, selectedBook],
  );

  const collectionLabel = COLLECTIONS.find((c) => c.id === browseCollection)?.label ?? browseCollection;

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { label: "Browse", onClick: selectedBook !== null ? () => setSelectedBook(null) : undefined },
      { label: collectionLabel },
    ];
    if (selectedBook !== null && selectedBookData) {
      // Make collection clickable when we're in a book
      items[1] = { label: collectionLabel, onClick: () => setSelectedBook(null) };
      items.push({ label: `Book ${selectedBookData.bookNumber}: ${selectedBookData.bookName}` });
    }
    return items;
  }, [collectionLabel, selectedBook, selectedBookData]);

  return (
    <>
      {/* Collection selector */}
      <div className="shrink-0 space-y-2">
        <div className="flex flex-wrap gap-1">
          {COLLECTIONS.map((c) => {
            const meta = COLLECTION_META[c.id];
            const isActive = c.id === browseCollection;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setBrowseCollection(c.id);
                  setSelectedBook(null);
                }}
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
      </div>

      {/* Breadcrumb navigation */}
      <PanelBreadcrumb items={breadcrumbItems} />

      {/* Book list or hadiths */}
      {selectedBook === null ? (
        <div className="space-y-0.5">
          {booksLoading && (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loading books...</span>
            </div>
          )}

          {!booksLoading && books && books.length === 0 && (
            <p className="text-xs text-muted-foreground/70 italic py-4 text-center">
              No books found.
            </p>
          )}

          {books?.map((book) => (
            <button
              key={book.bookNumber}
              onClick={() => setSelectedBook(book.bookNumber)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-hover group"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 text-[11px] font-mono text-muted-foreground group-hover:bg-muted">
                {book.bookNumber}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground/90 leading-snug line-clamp-2">
                  {book.bookName}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {book.hadithCount} hadith{book.hadithCount !== 1 ? "s" : ""}
                </p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Book header */}
          {selectedBookData && (
            <div className="rounded-lg bg-muted/30 px-3 py-2 mb-1">
              <p className="text-[11px] font-medium text-foreground/80">
                Book {selectedBookData.bookNumber}: {selectedBookData.bookName}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                {selectedBookData.hadithCount} hadith{selectedBookData.hadithCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {hadithsLoading && (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Loading hadiths...</span>
            </div>
          )}

          {!hadithsLoading && bookHadiths && bookHadiths.length === 0 && (
            <p className="text-xs text-muted-foreground/70 italic py-4 text-center">
              No hadiths found in this book.
            </p>
          )}

          {bookHadiths?.map((h, i) => (
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
  );
}

/* ─── Hadith card ─── */

function HadithCard({
  hadith,
  expanded,
  onToggle,
}: {
  hadith: Hadith;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { focusedVerseKey, openPanel } = usePanels();
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);

  const sanitizedHtml = useMemo(() => sanitize(hadith.text), [hadith.text]);
  const plainText = useMemo(() => hadith.text.replace(/<[^>]+>/g, ""), [hadith.text]);
  const preview = useMemo(() => {
    return plainText.length > 150 ? plainText.slice(0, 150) + "..." : plainText;
  }, [plainText]);
  const parsed = useMemo(() => parseGrade(hadith.grade), [hadith.grade]);
  const hasGrade = parsed !== null;
  const category = parsed ? categorizeGrade(parsed.label) : "unknown";
  const meta = COLLECTION_META[hadith.collection];

  const collectionName = meta?.name?.split(" ").pop() ?? hadith.collection;

  const handleSaveToNotes = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = `${collectionName} Hadith #${hadith.hadithNumber}`;
    const linkedResource: LinkedResource = {
      type: "hadith",
      label: `${collectionName} #${hadith.hadithNumber}`,
      preview: plainText.slice(0, 200),
      sourceUrl: hadith.reference ?? undefined,
      metadata: {
        collection: hadith.collection,
        hadithNumber: hadith.hadithNumber,
        ...(hadith.grade ? { grade: hadith.grade } : {}),
      },
    };
    const now = new Date();
    await db.notes.put({
      id: crypto.randomUUID(),
      title,
      verseKeys: focusedVerseKey ? [focusedVerseKey] : [],
      surahIds: [],
      content: plainText,
      tags: [hadith.collection],
      pinned: false,
      linkedResources: [linkedResource],
      createdAt: now,
      updatedAt: now,
    });
    openPanel("notes");
    setSaved(true);
    addToast("Hadith saved to notes", "success");
    setTimeout(() => setSaved(false), 2000);
  }, [collectionName, hadith, plainText, focusedVerseKey, openPanel, addToast]);

  return (
    <div
      className={cn(
        "group rounded-lg transition-all",
        expanded
          ? "bg-surface/80 ring-1 ring-border/40"
          : "hover:bg-surface/50",
      )}
      style={{ borderLeft: `3px solid ${meta?.accentColor ?? "#666"}` }}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-2.5 p-3 text-left"
      >
        <div className="flex-1 min-w-0">
          {/* Book name */}
          {hadith.bookName && (
            <p className="text-[10px] text-muted-foreground/60 mb-1 leading-snug">
              {hadith.bookName}
            </p>
          )}

          {/* Top row: collection badge + number + grade */}
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold",
              meta?.badge ?? "bg-muted text-muted-foreground",
            )}>
              {meta?.name?.split(" ").pop() ?? hadith.collection}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/70 font-medium">
              Hadith #{hadith.hadithNumber}
            </span>
            {hasGrade && parsed ? (
              <GradePill label={parsed.label} category={category} />
            ) : (
              <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground/50 bg-muted/50">
                Ungraded
              </span>
            )}
          </div>

          {/* Narrator */}
          {hadith.narratedBy && (
            <p className="text-[11px] text-muted-foreground/70 mb-1 italic leading-snug">
              {hadith.narratedBy}
            </p>
          )}

          {/* Topic chips */}
          {hadith.topics && hadith.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {hadith.topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none"
                  style={{ backgroundColor: "rgba(99,102,241,0.12)", color: "rgb(129,140,248)" }}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Preview text (collapsed) */}
          {!expanded && (
            <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {preview}
            </p>
          )}
        </div>

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground/40 mt-1 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Full text */}
          <div
            className="text-[15px] leading-[1.9] text-foreground/90 [&_b]:font-semibold [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />

          {/* Metadata footer */}
          <div className="rounded-lg bg-muted/40 px-3 py-2.5 space-y-2">
            {/* Reference line */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Info className="h-3 w-3 shrink-0" />
              <span>
                {hadith.inBookReference ?? `Book ${hadith.bookNumber}, Hadith ${hadith.hadithNumber}`}
              </span>
            </div>

            {/* Grade with grader */}
            {parsed && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <GradePill label={parsed.label} category={category} />
                {parsed.grader && (
                  <span className="text-muted-foreground/70">
                    graded by {parsed.grader}
                  </span>
                )}
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-3 pt-0.5">
              {hadith.reference && (
                <a
                  href={hadith.reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  sunnah.com
                </a>
              )}
              <CopyButton text={plainText} />
              <button
                onClick={handleSaveToNotes}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] transition-colors",
                  saved
                    ? "text-emerald-500"
                    : "text-muted-foreground/60 hover:text-muted-foreground",
                )}
              >
                {saved ? (
                  <>
                    <Check className="h-3 w-3" />
                    Saved
                  </>
                ) : (
                  <>
                    <StickyNote className="h-3 w-3" />
                    Save to Notes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Grade pill ─── */

function GradePill({ label, category }: { label: string; category: GradeCategory }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
        GRADE_STYLES[category],
      )}
    >
      {label}
    </span>
  );
}

/* ─── Copy button ─── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className={cn(
        "inline-flex items-center gap-1 text-[10px] transition-colors",
        copied
          ? "text-emerald-500"
          : "text-muted-foreground/60 hover:text-muted-foreground",
      )}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  );
}
