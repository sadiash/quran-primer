"use client";

import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { BookText, Search, ExternalLink, Copy, Check, ChevronDown, Info } from "lucide-react";
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
  { id: "nasai", label: "Nasa'i" },
  { id: "ibnmajah", label: "Ibn Majah" },
];

/** Display-friendly collection names + colors */
const COLLECTION_META: Record<string, { name: string; accent: string; badge: string }> = {
  bukhari: { name: "Sahih al-Bukhari", accent: "border-l-emerald-400", badge: "bg-emerald-500/15 text-emerald-400" },
  muslim: { name: "Sahih Muslim", accent: "border-l-teal-400", badge: "bg-teal-500/15 text-teal-400" },
  abudawud: { name: "Sunan Abu Dawud", accent: "border-l-sky-400", badge: "bg-sky-500/15 text-sky-400" },
  tirmidhi: { name: "Jami at-Tirmidhi", accent: "border-l-violet-400", badge: "bg-violet-500/15 text-violet-400" },
  nasai: { name: "Sunan an-Nasa'i", accent: "border-l-rose-400", badge: "bg-rose-500/15 text-rose-400" },
  ibnmajah: { name: "Sunan Ibn Majah", accent: "border-l-amber-400", badge: "bg-amber-500/15 text-amber-400" },
};

/* ─── Grade helpers ─── */

interface ParsedGrade {
  label: string;   // e.g. "Sahih", "Hasan", "Da'if"
  grader: string | null; // e.g. "Darussalam", "Al-Albani"
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

/* ─── Main section ─── */

export function HadithSection() {
  const { focusedVerseKey } = usePanels();
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<string | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
      <div className="space-y-0.5">
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
    </div>
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
  const sanitizedHtml = useMemo(() => sanitize(hadith.text), [hadith.text]);
  const preview = useMemo(() => {
    const plain = hadith.text.replace(/<[^>]+>/g, "");
    return plain.length > 150 ? plain.slice(0, 150) + "..." : plain;
  }, [hadith.text]);
  const parsed = useMemo(() => parseGrade(hadith.grade), [hadith.grade]);
  const hasGrade = parsed !== null;
  const category = parsed ? categorizeGrade(parsed.label) : "unknown";
  const meta = COLLECTION_META[hadith.collection];

  return (
    <div
      className={cn(
        "group rounded-lg border-l-[3px] transition-all",
        meta?.accent ?? "border-l-muted-foreground/30",
        expanded
          ? "bg-surface/80 ring-1 ring-border/40"
          : "hover:bg-surface/50",
      )}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-2.5 p-3 text-left"
      >
        <div className="flex-1 min-w-0">
          {/* Top row: collection badge + number + grade */}
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold",
              meta?.badge ?? "bg-muted text-muted-foreground",
            )}>
              {meta?.name?.split(" ").pop() ?? hadith.collection}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/50">
              #{hadith.hadithNumber}
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

          {/* Preview text (collapsed) */}
          {!expanded && (
            <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
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
            className="text-[13px] leading-[1.85] text-foreground/90 [&_b]:font-semibold [&_strong]:font-semibold"
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
              <CopyButton text={hadith.text.replace(/<[^>]+>/g, "")} />
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
