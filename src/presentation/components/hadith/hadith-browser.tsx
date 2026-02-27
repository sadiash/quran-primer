"use client";

import { useState, useMemo } from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { useFetch } from "@/presentation/hooks/use-fetch";
import type { Hadith, HadithBook } from "@/core/types";
import { cn } from "@/lib/utils";
import { BracketLabel, RadioOption } from "@/presentation/components/ui/bracket-helpers";
import {
  COLLECTIONS,
  COLLECTION_META,
  categorizeGrade,
  parseGrade,
  type GradeFilter,
} from "./constants";
import { HadithCard } from "./hadith-card";

/** The two Sahih collections are "featured" — shown larger */
const FEATURED_COLLECTIONS = new Set(["bukhari", "muslim"]);

/** Arabic names for collections (decorative watermark) */
const COLLECTION_ARABIC: Record<string, string> = {
  bukhari: "البخاري",
  muslim: "مسلم",
  abudawud: "أبو داود",
  tirmidhi: "الترمذي",
  nasai: "النسائي",
  ibnmajah: "ابن ماجه",
};

type SortMode = "number" | "name" | "count";

export function HadithBrowser() {
  const { preferences } = usePreferences();
  const enabledCollections = useMemo(
    () => COLLECTIONS.filter((c) => preferences.activeHadithCollections.includes(c.id)),
    [preferences.activeHadithCollections],
  );

  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("number");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");

  // Load books for selected collection
  const booksUrl = selectedCollection
    ? `/api/v1/hadith/browse?collection=${selectedCollection}`
    : null;
  const booksKey = `browse:books:${selectedCollection ?? "none"}`;
  const { data: books, isLoading: booksLoading } = useFetch<HadithBook[]>(booksUrl, booksKey);

  // Load hadiths for selected book
  const hadithsUrl = selectedCollection && selectedBook !== null
    ? `/api/v1/hadith/browse?collection=${selectedCollection}&book=${selectedBook}`
    : null;
  const hadithsKey = `browse:hadiths:${selectedCollection ?? "none"}:${selectedBook ?? "none"}`;
  const { data: bookHadiths, isLoading: hadithsLoading } = useFetch<Hadith[]>(hadithsUrl, hadithsKey);

  const selectedBookData = useMemo(
    () => books?.find((b) => b.bookNumber === selectedBook),
    [books, selectedBook],
  );

  const collectionMeta = selectedCollection ? COLLECTION_META[selectedCollection] : null;
  const collectionLabel = COLLECTIONS.find((c) => c.id === selectedCollection)?.label ?? selectedCollection;

  // Filter books by search
  const filteredBooks = useMemo(() => {
    if (!books) return books;
    let result = [...books];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bookName.toLowerCase().includes(q) ||
          b.bookNumber.toString() === q,
      );
    }
    switch (sort) {
      case "name":
        result.sort((a, b) => a.bookName.localeCompare(b.bookName));
        break;
      case "count":
        result.sort((a, b) => b.hadithCount - a.hadithCount);
        break;
      default:
        break;
    }
    return result;
  }, [books, search, sort]);

  // Filter hadiths by grade
  const filteredHadiths = useMemo(() => {
    if (!bookHadiths || gradeFilter === "all") return bookHadiths;
    return bookHadiths.filter((h) => {
      const parsed = parseGrade(h.grade);
      if (!parsed) return false;
      const cat = categorizeGrade(parsed.label);
      return cat === gradeFilter;
    });
  }, [bookHadiths, gradeFilter]);

  // Filter collections by search (when at top level)
  const filteredCollections = useMemo(() => {
    if (!search || selectedCollection) return enabledCollections;
    const q = search.toLowerCase();
    return enabledCollections.filter(
      (c) => {
        const meta = COLLECTION_META[c.id];
        return (
          c.label.toLowerCase().includes(q) ||
          (meta?.name ?? "").toLowerCase().includes(q)
        );
      },
    );
  }, [enabledCollections, search, selectedCollection]);

  const totalHadiths = "33,738";

  const handleReset = () => {
    setSearch("");
    setSort("number");
    setGradeFilter("all");
  };

  const handleBack = () => {
    if (selectedBook !== null) {
      setSelectedBook(null);
      setSearch("");
      setGradeFilter("all");
    } else if (selectedCollection) {
      setSelectedCollection(null);
      setSearch("");
    }
  };

  // Current level for sidebar
  const level: "collections" | "books" | "hadiths" =
    selectedBook !== null ? "hadiths" : selectedCollection ? "books" : "collections";

  return (
    <div className="relative z-10">
      {/* Top header */}
      <header className="border-b border-border px-6 py-5 sm:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1 block">
              The Primer / Hadith
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-none text-foreground">
              {!selectedCollection
                ? `${enabledCollections.length} Collections`
                : collectionLabel}
            </h1>
          </div>
          <div className="hidden sm:block text-right">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground leading-relaxed block">
              {!selectedCollection ? (
                <>
                  Browse the prophetic traditions.
                  <br />
                  {totalHadiths} Hadiths across {enabledCollections.length} collections.
                </>
              ) : !selectedBook ? (
                <>
                  {collectionMeta?.name ?? collectionLabel}
                  <br />
                  {books?.length ?? "..."} Books
                </>
              ) : (
                <>
                  Book {selectedBookData?.bookNumber}: {selectedBookData?.bookName}
                  <br />
                  {bookHadiths?.length ?? "..."} Hadiths
                </>
              )}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <aside className="shrink-0 border-b lg:border-b-0 lg:border-r border-border/20 w-full lg:w-[260px] px-6 py-6 sm:px-10 lg:px-6 lg:sticky lg:top-0 lg:h-[calc(100vh-120px)] lg:overflow-y-auto">
          {/* Breadcrumb nav */}
          {selectedCollection && (
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Search */}
          <div className="mb-8">
            <BracketLabel>Search</BracketLabel>
            <input
              type="text"
              placeholder={
                level === "collections"
                  ? "Search collections..."
                  : level === "books"
                    ? "Search books..."
                    : "Search hadiths..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-b-2 border-foreground bg-transparent py-2 font-mono text-sm text-foreground outline-none placeholder:opacity-30"
            />
          </div>

          {/* Grade filter — only at hadith level */}
          {level === "hadiths" && (
            <div className="mb-8">
              <BracketLabel>Filter by Grade</BracketLabel>
              <div className="space-y-2.5">
                <RadioOption
                  selected={gradeFilter === "all"}
                  onClick={() => setGradeFilter("all")}
                  label="All Grades"
                  suffix={bookHadiths ? `(${bookHadiths.length})` : undefined}
                />
                <RadioOption
                  selected={gradeFilter === "sahih"}
                  onClick={() => setGradeFilter("sahih")}
                  label="Sahih"
                  dotColor="var(--surah-teal-label)"
                />
                <RadioOption
                  selected={gradeFilter === "hasan"}
                  onClick={() => setGradeFilter("hasan")}
                  label="Hasan"
                  dotColor="var(--surah-yellow-label)"
                />
                <RadioOption
                  selected={gradeFilter === "daif"}
                  onClick={() => setGradeFilter("daif")}
                  label="Da'if"
                  dotColor="var(--surah-pink-label)"
                />
              </div>
            </div>
          )}

          {/* Sort — at books level */}
          {level === "books" && (
            <div className="mb-8">
              <BracketLabel>Sort by</BracketLabel>
              <div className="space-y-2.5">
                <RadioOption
                  selected={sort === "number"}
                  onClick={() => setSort("number")}
                  label="Book Number"
                />
                <RadioOption
                  selected={sort === "name"}
                  onClick={() => setSort("name")}
                  label="Book Name"
                />
                <RadioOption
                  selected={sort === "count"}
                  onClick={() => setSort("count")}
                  label="Hadith Count"
                />
              </div>
            </div>
          )}

          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-full border-2 border-foreground bg-transparent py-2 font-mono text-[10px] tracking-[0.15em] uppercase text-foreground transition-opacity hover:opacity-60"
          >
            [ Reset Filters ]
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 px-4 py-5 sm:px-6 lg:px-6">
          {/* Breadcrumb trail */}
          <div className="flex items-center gap-1 mb-3 pb-3 border-b border-border/20 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <button
              onClick={() => { setSelectedCollection(null); setSelectedBook(null); setSearch(""); setGradeFilter("all"); }}
              className={cn(
                "transition-colors",
                !selectedCollection ? "text-foreground font-bold" : "hover:text-foreground",
              )}
            >
              [ Collections ]
            </button>
            {selectedCollection && (
              <>
                <span className="mx-1">→</span>
                <button
                  onClick={() => { setSelectedBook(null); setSearch(""); setGradeFilter("all"); }}
                  className={cn(
                    "transition-colors",
                    selectedBook === null ? "font-bold" : "hover:text-foreground",
                  )}
                  style={selectedBook === null ? { color: collectionMeta?.labelColor } : undefined}
                >
                  [ {collectionLabel?.toUpperCase()} ]
                </button>
              </>
            )}
            {selectedBook !== null && selectedBookData && (
              <>
                <span className="mx-1">→</span>
                <span className="font-bold text-foreground truncate">
                  [ Book {selectedBookData.bookNumber} ]
                </span>
              </>
            )}
          </div>

          {/* ─── Collections Grid ─── */}
          {!selectedCollection && (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  Showing {filteredCollections.length} of {enabledCollections.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredCollections.map((c) => {
                  const meta = COLLECTION_META[c.id];
                  const isFeatured = FEATURED_COLLECTIONS.has(c.id);
                  const arabic = COLLECTION_ARABIC[c.id];
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCollection(c.id); setSearch(""); }}
                      className={cn(
                        "group relative flex flex-col border overflow-hidden transition-all duration-150 text-left",
                        isFeatured
                          ? "sm:col-span-2 min-h-[180px] border-transparent"
                          : "min-h-[140px] border-border/20 bg-background text-foreground",
                      )}
                      style={isFeatured ? { backgroundColor: meta?.accentColor ?? "#78d5c4", color: "#0a0a0a" } : undefined}
                    >
                      {/* Arabic watermark */}
                      {arabic && (
                        <p
                          className={cn(
                            "absolute top-2 right-3 leading-none select-none pointer-events-none transition-opacity duration-300 opacity-[0.08] group-hover:opacity-[0.15] arabic-display",
                            isFeatured ? "text-[4.5rem]" : "text-[2.5rem]",
                          )}
                          dir="rtl"
                          style={{ color: isFeatured ? "#0a0a0a" : undefined }}
                        >
                          {arabic}
                        </p>
                      )}

                      {/* Top meta */}
                      <div className="flex items-center justify-between px-3 pt-3 relative z-[1]">
                        <span
                          className={cn(
                            "font-mono text-[9px] uppercase tracking-[0.15em]",
                            isFeatured ? "text-[rgba(10,10,10,0.5)]" : "text-muted-foreground",
                          )}
                        >
                          {isFeatured ? "SAHIH" : "SUNAN"}
                        </span>
                      </div>

                      {/* Main text — pushed to bottom */}
                      <div className="flex-1 flex flex-col justify-end px-3 pb-2 relative z-[1]">
                        <p
                          className={cn(
                            "font-display font-bold leading-[1.1]",
                            isFeatured ? "text-[2rem]" : "text-[1.25rem]",
                          )}
                        >
                          {c.label}
                        </p>
                        <span
                          className={cn(
                            "font-mono text-[10px] uppercase tracking-[0.15em] mt-0.5",
                            isFeatured ? "text-[rgba(10,10,10,0.5)]" : "text-muted-foreground",
                          )}
                        >
                          {meta?.name ?? c.label}
                        </span>
                      </div>

                      {/* Bottom bar */}
                      <div
                        className={cn(
                          "flex items-center justify-between border-t px-3 py-1.5 relative z-[1]",
                          isFeatured ? "border-[rgba(10,10,10,0.1)]" : "border-border/20",
                        )}
                      >
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em]">
                          {c.id.toUpperCase()}
                        </span>
                      </div>

                      {/* Hover accent bar */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                        style={{ backgroundColor: isFeatured ? "#0a0a0a" : meta?.accentColor ?? "#666" }}
                      />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ─── Books Grid ─── */}
          {selectedCollection && selectedBook === null && (
            <>
              {booksLoading && (
                <div className="flex items-center justify-center gap-2 py-16">
                  <CircleNotchIcon weight="bold" className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">Loading books...</span>
                </div>
              )}

              {!booksLoading && filteredBooks && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      Showing {filteredBooks.length} of {books?.length ?? 0} books
                    </span>
                  </div>

                  {filteredBooks.length === 0 && (
                    <div className="py-20 text-center">
                      <p className="font-display text-5xl font-bold mb-2 text-foreground">0</p>
                      <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                        {search ? `No books match "${search}"` : "No books found"}
                      </span>
                    </div>
                  )}

                  {filteredBooks.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {filteredBooks.map((book) => {
                        const isFeaturedBook = book.hadithCount >= 50;
                        return (
                          <button
                            key={book.bookNumber}
                            onClick={() => { setSelectedBook(book.bookNumber); setSearch(""); }}
                            className={cn(
                              "group relative flex flex-col border overflow-hidden transition-all duration-150 text-left",
                              isFeaturedBook
                                ? "sm:col-span-2 min-h-[140px] border-transparent"
                                : "min-h-[100px] border-border/20 bg-background text-foreground",
                            )}
                            style={
                              isFeaturedBook
                                ? { backgroundColor: collectionMeta?.accentColor ?? "#78d5c4", color: "#0a0a0a" }
                                : undefined
                            }
                          >
                            {/* Top meta */}
                            <div className="flex items-center justify-between px-3 pt-3 relative z-[1]">
                              <span
                                className={cn(
                                  "font-mono text-[9px] uppercase tracking-[0.15em]",
                                  isFeaturedBook ? "text-[rgba(10,10,10,0.5)]" : "text-muted-foreground",
                                )}
                              >
                                {book.hadithCount} hadith{book.hadithCount !== 1 ? "s" : ""}
                              </span>
                            </div>

                            {/* Main text */}
                            <div className="flex-1 flex flex-col justify-end px-3 pb-2 relative z-[1]">
                              <p
                                className={cn(
                                  "font-display font-bold leading-[1.15]",
                                  isFeaturedBook ? "text-[1.5rem]" : "text-[1rem]",
                                )}
                              >
                                {book.bookName}
                              </p>
                            </div>

                            {/* Bottom bar */}
                            <div
                              className={cn(
                                "flex items-center justify-between border-t px-3 py-1.5 relative z-[1]",
                                isFeaturedBook ? "border-[rgba(10,10,10,0.1)]" : "border-border/20",
                              )}
                            >
                              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em]">
                                {String(book.bookNumber).padStart(3, "0")}
                              </span>
                            </div>

                            {/* Hover accent bar */}
                            <div
                              className="absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                              style={{ backgroundColor: isFeaturedBook ? "#0a0a0a" : collectionMeta?.accentColor ?? "#666" }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ─── Hadith List ─── */}
          {selectedCollection && selectedBook !== null && (
            <>
              {hadithsLoading && (
                <div className="flex items-center justify-center gap-2 py-16">
                  <CircleNotchIcon weight="bold" className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">Loading hadiths...</span>
                </div>
              )}

              {!hadithsLoading && filteredHadiths && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      Showing {filteredHadiths.length} of {bookHadiths?.length ?? 0} hadiths
                      {gradeFilter !== "all" && ` — ${gradeFilter}`}
                    </span>
                  </div>

                  {filteredHadiths.length === 0 && (
                    <div className="py-20 text-center">
                      <p className="font-display text-5xl font-bold mb-2 text-foreground">0</p>
                      <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                        No hadiths match the current filter
                      </span>
                    </div>
                  )}

                  {filteredHadiths.length > 0 && (
                    <div className="space-y-2">
                      {filteredHadiths.map((h) => (
                        <HadithCard
                          key={`${h.collection}-${h.hadithNumber}`}
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
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
