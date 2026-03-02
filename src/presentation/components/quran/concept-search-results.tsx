"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useFetch } from "@/presentation/hooks/use-fetch";
import { getSurahColor } from "@/lib/surah-colors";
import { BracketLabel } from "@/presentation/components/ui/bracket-helpers";
import type { ConceptMatch } from "@/presentation/hooks/use-concept-search";

interface ConceptSearchResultsProps {
  matches: ConceptMatch[];
  totalVerses: number;
  query: string;
}

export function ConceptSearchResults({
  matches,
  totalVerses,
  query,
}: ConceptSearchResultsProps) {
  return (
    <div>
      {/* Summary header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/20">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {matches.length} concept{matches.length !== 1 ? "s" : ""},{" "}
          {totalVerses} verse{totalVerses !== 1 ? "s" : ""} for &ldquo;{query}
          &rdquo;
        </span>
      </div>

      {/* Concept sections */}
      <div className="space-y-6">
        {matches.map((concept) => (
          <ConceptSection key={concept.id} concept={concept} />
        ))}
      </div>
    </div>
  );
}

function ConceptSection({ concept }: { concept: ConceptMatch }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const displayName = concept.id.replace(/-/g, " ");
  // Use a hash of the concept name to pick a color
  let hash = 0;
  for (let i = 0; i < concept.id.length; i++)
    hash = ((hash << 5) - hash + concept.id.charCodeAt(i)) | 0;
  const colorIdx = ((hash % 4) + 4) % 4;
  const color = getSurahColor(colorIdx + 1);

  const visibleVerses = showAll ? concept.verses : concept.verses.slice(0, 5);

  const toggleVerse = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <div>
      {/* Concept header */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 shrink-0"
            style={{ backgroundColor: color.accent }}
          />
          <h3 className="font-display text-lg font-bold capitalize text-foreground">
            {displayName}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {concept.verses.length} verse{concept.verses.length !== 1 ? "s" : ""}
          </span>
        </div>
        {concept.definition && (
          <p className="text-sm text-muted-foreground ml-4 line-clamp-2">
            {concept.definition}
          </p>
        )}
      </div>

      {/* Verse rows */}
      <div className="space-y-1 ml-4">
        {visibleVerses.map((v) => (
          <VerseRow
            key={v.key}
            verseKey={v.key}
            surahId={v.surahId}
            color={color}
            isExpanded={expanded.has(v.key)}
            onToggle={() => toggleVerse(v.key)}
          />
        ))}
      </div>

      {/* Show all button */}
      {concept.verses.length > 5 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="ml-4 mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          [ Show all {concept.verses.length} verses ]
        </button>
      )}
    </div>
  );
}

interface VerseData {
  verseKey: string;
  textUthmani: string;
  translation: string | null;
  surahName: string | null;
}

function VerseRow({
  verseKey,
  surahId,
  color,
  isExpanded,
  onToggle,
}: {
  verseKey: string;
  surahId: number;
  color: ReturnType<typeof getSurahColor>;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // Only fetch when expanded
  const fetchUrl = isExpanded ? `/api/v1/verse?key=${verseKey}` : null;
  const { data, isLoading } = useFetch<VerseData>(fetchUrl, `verse:${verseKey}`);

  const surahColor = getSurahColor(surahId);
  const [surahNum, verseNum] = verseKey.split(":");
  const paddedSurah = surahNum!.padStart(3, "0");
  const paddedVerse = verseNum!.padStart(3, "0");

  return (
    <div>
      {/* Compact row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-1.5 px-2 text-left transition-colors hover:bg-surface/50 group"
        style={{ borderLeft: `3px solid ${surahColor.accent}` }}
      >
        <span className="font-mono text-[10px] font-bold tracking-[0.05em] text-muted-foreground shrink-0">
          [{paddedSurah}:{paddedVerse}]
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate flex-1">
          {data?.surahName ?? `Surah ${surahNum}`}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isExpanded ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="ml-2 pl-3 pb-3 pt-1" style={{ borderLeft: `3px solid ${surahColor.accent}` }}>
          {isLoading && (
            <div className="flex items-center gap-2 py-2">
              <CircleNotchIcon weight="bold" className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground">Loading...</span>
            </div>
          )}

          {data && (
            <>
              {/* Arabic text */}
              <p
                className="arabic-reading text-xl mb-2"
                dir="rtl"
                lang="ar"
              >
                {data.textUthmani}
              </p>

              {/* Translation */}
              {data.translation && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {data.translation.replace(/<[^>]*>/g, "")}
                </p>
              )}

              {/* Read in context link */}
              <Link
                href={`/surah/${surahNum}?verse=${verseKey}&from=concepts`}
                className="inline-block font-mono text-[10px] uppercase tracking-[0.15em] transition-colors hover:text-foreground"
                style={{ color: surahColor.label }}
              >
                Read in context →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
