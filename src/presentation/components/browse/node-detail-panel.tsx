"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { CircleNotchIcon, XIcon } from "@phosphor-icons/react";
import { useFetch } from "@/presentation/hooks/use-fetch";
import { COLLECTION_META, parseGrade, categorizeGrade, sanitizeHadithHtml } from "@/presentation/components/hadith/constants";
import { GradePill } from "@/presentation/components/hadith/hadith-card";
import { getSurahColor } from "@/lib/surah-colors";
import type { GraphNode } from "@/core/types";
import type { Hadith } from "@/core/types";

interface NodeDetailPanelProps {
  node: GraphNode;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const definition = (node.metadata?.definition as string) ?? null;
  const verseCount = (node.metadata?.verseCount as number) ?? 0;
  const verses = (node.metadata?.verses as { surahId: number; verseId: number }[]) ?? [];
  const hadithCount = (node.metadata?.hadithCount as number) ?? 0;
  const subTopics = (node.metadata?.subTopics as string[]) ?? [];
  const topicId = (node.metadata?.topicId as string) ?? null;
  const isCategory = (node.metadata?.isCategory as boolean) ?? false;

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold text-foreground capitalize truncate">
              {node.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <XIcon weight="bold" className="h-4 w-4" />
          </button>
        </div>

        {definition && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {definition}
          </p>
        )}

        {/* Stats line — show whatever counts we know */}
        <div className="flex items-center gap-3 mt-2">
          {verseCount > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {verseCount} verse{verseCount !== 1 ? "s" : ""}
            </span>
          )}
          {hadithCount > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {hadithCount.toLocaleString()} hadith{hadithCount !== 1 ? "s" : ""}
            </span>
          )}
          {isCategory && (
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50">
              Category
            </span>
          )}
        </div>

        {/* Sub-topics chips */}
        {subTopics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {subTopics.slice(0, 6).map((sub) => (
              <span
                key={sub}
                className="font-mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5"
                style={{
                  backgroundColor: "var(--surah-lavender-bg)",
                  color: "var(--surah-lavender-label)",
                }}
              >
                {sub.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
            ))}
            {subTopics.length > 6 && (
              <span className="font-mono text-[9px] text-muted-foreground">
                +{subTopics.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Verses section — show if this node has verse refs */}
        {verses.length > 0 && (
          <VersesSection verses={verses} />
        )}

        {/* Hadiths section — always attempt to find related hadiths */}
        {topicId ? (
          <TopicHadithsSection topicId={topicId} hadithCount={hadithCount} />
        ) : (
          <KeywordHadithsSection label={node.label} nodeId={node.id} />
        )}
      </div>
    </div>
  );
}

/* ─── Verses section ─── */

function VersesSection({ verses: rawVerses }: { verses: { surahId: number; verseId: number }[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Deduplicate verses by key
  const verses = useMemo(() => {
    const seen = new Set<string>();
    return rawVerses.filter((v) => {
      const key = `${v.surahId}:${v.verseId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [rawVerses]);

  const displayVerses = showAll ? verses : verses.slice(0, 8);

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
      <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
        [ Verses ]
      </h3>
      <div className="space-y-1">
        {displayVerses.map((v) => {
          const key = `${v.surahId}:${v.verseId}`;
          return (
            <VerseRow
              key={key}
              verseKey={key}
              surahId={v.surahId}
              isExpanded={expanded.has(key)}
              onToggle={() => toggleVerse(key)}
            />
          );
        })}
      </div>
      {verses.length > 8 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          [ Show all {verses.length} verses ]
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
  isExpanded,
  onToggle,
}: {
  verseKey: string;
  surahId: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const fetchUrl = isExpanded ? `/api/v1/verse?key=${verseKey}` : null;
  const { data, isLoading } = useFetch<VerseData>(fetchUrl, `verse:${verseKey}`);

  const surahColor = getSurahColor(surahId);
  const [surahNum, verseNum] = verseKey.split(":");
  const paddedSurah = surahNum!.padStart(3, "0");
  const paddedVerse = verseNum!.padStart(3, "0");

  return (
    <div>
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
          {isExpanded ? "\u25B2" : "\u25BC"}
        </span>
      </button>

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
              <p className="arabic-reading text-xl mb-2" dir="rtl" lang="ar">
                {data.textUthmani}
              </p>
              {data.translation && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {data.translation.replace(/<[^>]*>/g, "")}
                </p>
              )}
              <Link
                href={`/surah/${surahNum}?verse=${verseKey}`}
                className="inline-block font-mono text-[10px] uppercase tracking-[0.15em] transition-colors hover:text-foreground"
                style={{ color: surahColor.label }}
              >
                Read in context &rarr;
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Hadith row (compact, expandable — mirrors verse rows) ─── */

function HadithRow({
  hadith,
  isExpanded,
  onToggle,
}: {
  hadith: Hadith;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const meta = COLLECTION_META[hadith.collection];
  const collectionName = meta?.name?.split(" ").pop() ?? hadith.collection;
  const plainText = useMemo(() => hadith.text.replace(/<[^>]+>/g, ""), [hadith.text]);
  const sanitizedHtml = useMemo(() => sanitizeHadithHtml(hadith.text), [hadith.text]);
  const parsed = useMemo(() => parseGrade(hadith.grade), [hadith.grade]);
  const category = parsed ? categorizeGrade(parsed.label) : "unknown";

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 py-1.5 px-2 text-left transition-colors hover:bg-surface/50 group"
        style={{ borderLeft: `3px solid ${meta?.accentColor ?? "#666"}` }}
      >
        <span
          className="font-mono text-[10px] font-bold tracking-[0.05em] shrink-0"
          style={{ color: meta?.labelColor ?? "var(--muted-foreground)" }}
        >
          [{collectionName} #{hadith.hadithNumber}]
        </span>
        <span className="font-mono text-[10px] text-muted-foreground truncate flex-1">
          {plainText.length > 80 ? plainText.slice(0, 80) + "..." : plainText}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isExpanded ? "\u25B2" : "\u25BC"}
        </span>
      </button>

      {isExpanded && (
        <div className="ml-2 pl-3 pb-3 pt-2" style={{ borderLeft: `3px solid ${meta?.accentColor ?? "#666"}` }}>
          {/* Narrator */}
          {hadith.narratedBy && (
            <p className="text-xs font-medium text-foreground/70 mb-2 leading-snug">
              {hadith.narratedBy}
            </p>
          )}

          {/* Full text */}
          <div
            className="text-sm leading-relaxed text-foreground/90 mb-2 [&_b]:font-semibold [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />

          {/* Grade + reference */}
          <div className="flex items-center gap-2 flex-wrap">
            {parsed && <GradePill label={parsed.label} category={category} />}
            {hadith.inBookReference && (
              <span className="font-mono text-[9px] text-muted-foreground">
                {hadith.inBookReference}
              </span>
            )}
          </div>

          {/* Topics */}
          {hadith.topics && hadith.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {hadith.topics.map((topic) => (
                <span
                  key={topic}
                  className="font-mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5"
                  style={{ backgroundColor: "var(--surah-lavender-bg)", color: "var(--surah-lavender-label)" }}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Hadith sections ─── */

function HadithList({ hadiths, expandedId, setExpandedId }: {
  hadiths: Hadith[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}) {
  return (
    <div className="space-y-1">
      {hadiths.map((h) => {
        const id = `${h.collection}-${h.hadithNumber}`;
        return (
          <HadithRow
            key={id}
            hadith={h}
            isExpanded={expandedId === id}
            onToggle={() => setExpandedId(expandedId === id ? null : id)}
          />
        );
      })}
    </div>
  );
}

function TopicHadithsSection({ topicId, hadithCount }: { topicId: string; hadithCount: number }) {
  const [limit, setLimit] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchUrl = `/api/v1/hadith/topic?name=${encodeURIComponent(topicId)}&limit=${limit}&offset=0`;
  const { data: hadiths, isLoading } = useFetch<Hadith[]>(fetchUrl, `topic-panel:${topicId}:${limit}`);

  return (
    <div>
      <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
        [ Hadiths ]
      </h3>

      {isLoading && (
        <div className="flex items-center gap-2 py-4">
          <CircleNotchIcon weight="bold" className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground">Loading hadiths...</span>
        </div>
      )}

      {hadiths && hadiths.length > 0 && (
        <HadithList hadiths={hadiths} expandedId={expandedId} setExpandedId={setExpandedId} />
      )}

      {hadiths && limit < hadithCount && (
        <button
          onClick={() => setLimit((prev) => prev + 10)}
          className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          [ Load more &mdash; showing {hadiths.length} of {hadithCount.toLocaleString()} ]
        </button>
      )}

      {hadiths && hadiths.length === 0 && !isLoading && (
        <p className="font-mono text-[10px] text-muted-foreground py-2">No hadiths found.</p>
      )}
    </div>
  );
}

function KeywordHadithsSection({ label, nodeId }: { label: string; nodeId: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const searchTerm = label.trim();
  const fetchUrl = searchTerm
    ? `/api/v1/hadith?q=${encodeURIComponent(searchTerm)}`
    : null;
  const { data: hadiths, isLoading } = useFetch<Hadith[]>(fetchUrl, `kw-hadith:${nodeId}`);

  return (
    <div>
      <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
        [ Related Hadiths ]
      </h3>

      {isLoading && (
        <div className="flex items-center gap-2 py-4">
          <CircleNotchIcon weight="bold" className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="font-mono text-[10px] text-muted-foreground">Searching hadiths...</span>
        </div>
      )}

      {hadiths && hadiths.length > 0 && (
        <HadithList hadiths={hadiths.slice(0, 10)} expandedId={expandedId} setExpandedId={setExpandedId} />
      )}

      {hadiths && hadiths.length === 0 && !isLoading && (
        <p className="font-mono text-[10px] text-muted-foreground py-2">No related hadiths found.</p>
      )}
    </div>
  );
}
