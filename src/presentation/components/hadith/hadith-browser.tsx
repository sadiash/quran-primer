"use client";

import { useState, useMemo } from "react";
import { BooksIcon, CaretRightIcon, CircleNotchIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { useFetch } from "@/presentation/hooks/use-fetch";
import type { Hadith, HadithBook } from "@/core/types";
import { cn } from "@/lib/utils";
import {
  COLLECTIONS,
  COLLECTION_META,
} from "./constants";
import { HadithCard } from "./hadith-card";

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
    if (!books || !search) return books;
    const q = search.toLowerCase();
    return books.filter(
      (b) =>
        b.bookName.toLowerCase().includes(q) ||
        b.bookNumber.toString() === q,
    );
  }, [books, search]);

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <button
          onClick={() => { setSelectedCollection(null); setSelectedBook(null); setSearch(""); }}
          className={cn(
            "transition-colors",
            selectedCollection
              ? "hover:text-foreground"
              : "text-foreground font-medium",
          )}
        >
          Collections
        </button>
        {selectedCollection && (
          <>
            <CaretRightIcon weight="bold" className="h-3.5 w-3.5" />
            <button
              onClick={() => { setSelectedBook(null); setSearch(""); }}
              className={cn(
                "transition-colors",
                selectedBook !== null
                  ? "hover:text-foreground"
                  : "text-foreground font-medium",
              )}
              style={collectionMeta ? { color: selectedBook !== null ? undefined : collectionMeta.accentColor } : undefined}
            >
              {collectionLabel}
            </button>
          </>
        )}
        {selectedBook !== null && selectedBookData && (
          <>
            <CaretRightIcon weight="bold" className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate">
              Book {selectedBookData.bookNumber}: {selectedBookData.bookName}
            </span>
          </>
        )}
      </div>

      {/* ─── Collections grid ─── */}
      {!selectedCollection && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {enabledCollections.map((c) => {
            const meta = COLLECTION_META[c.id];
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCollection(c.id)}
                className={cn(
                  "group flex items-center gap-4 rounded-xl border border-border bg-card p-4",
                  "transition-all hover:shadow-soft-sm hover:border-primary/30 text-left",
                )}
                style={{ borderLeft: `4px solid ${meta?.accentColor ?? "#666"}` }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm"
                  style={{ backgroundColor: `${meta?.accentColor ?? "#666"}20`, color: meta?.accentColor ?? "#666" }}
                >
                  <BooksIcon weight="duotone" className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {c.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {meta?.name ?? c.label}
                  </p>
                </div>
                <CaretRightIcon weight="bold" className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
              </button>
            );
          })}
        </div>
      )}

      {/* ─── Book list ─── */}
      {selectedCollection && selectedBook === null && (
        <>
          {/* Search within books */}
          <div className="relative max-w-md">
            <MagnifyingGlassIcon weight="duotone" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {booksLoading && (
            <div className="flex items-center justify-center gap-2 py-12">
              <CircleNotchIcon weight="bold" className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading books...</span>
            </div>
          )}

          {!booksLoading && filteredBooks && filteredBooks.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {search ? `No books match "${search}"` : "No books found."}
            </p>
          )}

          {!booksLoading && filteredBooks && filteredBooks.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground">
                {filteredBooks.length} of {books?.length ?? 0} books
              </p>
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {filteredBooks.map((book) => (
                  <button
                    key={book.bookNumber}
                    onClick={() => { setSelectedBook(book.bookNumber); setSearch(""); }}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-hover group"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: `${collectionMeta?.accentColor ?? "#666"}15`,
                        color: collectionMeta?.accentColor ?? "#666",
                      }}
                    >
                      {book.bookNumber}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-snug truncate">
                        {book.bookName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {book.hadithCount} hadith{book.hadithCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <CaretRightIcon weight="bold" className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ─── Hadith list ─── */}
      {selectedCollection && selectedBook !== null && (
        <>
          {/* Book header */}
          {selectedBookData && (
            <div
              className="rounded-xl border border-border bg-card px-4 py-3"
              style={{ borderLeft: `4px solid ${collectionMeta?.accentColor ?? "#666"}` }}
            >
              <p className="text-sm font-semibold text-foreground">
                Book {selectedBookData.bookNumber}: {selectedBookData.bookName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedBookData.hadithCount} hadith{selectedBookData.hadithCount !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {hadithsLoading && (
            <div className="flex items-center justify-center gap-2 py-12">
              <CircleNotchIcon weight="bold" className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading hadiths...</span>
            </div>
          )}

          {!hadithsLoading && bookHadiths && bookHadiths.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No hadiths found in this book.
            </p>
          )}

          {!hadithsLoading && bookHadiths && bookHadiths.length > 0 && (
            <div className="space-y-2">
              {bookHadiths.map((h, i) => (
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
