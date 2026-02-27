"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { CaretDownIcon, InfoIcon } from "@phosphor-icons/react";
import { usePanels } from "@/presentation/providers/panel-provider";
import { useToast } from "@/presentation/components/ui/toast";
import { db } from "@/infrastructure/db/client";
import type { Hadith } from "@/core/types";
import type { LinkedResource } from "@/core/types/study";
import { cn } from "@/lib/utils";
import {
  COLLECTION_META,
  GRADE_STYLES,
  parseGrade,
  categorizeGrade,
  sanitizeHadithHtml,
  type GradeCategory,
} from "./constants";
import { LinkHadithToNoteMenu } from "./link-hadith-to-note-menu";

export function HadithCard({
  hadith,
  expanded,
  onToggle,
}: {
  hadith: Hadith;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { focusedVerseKey } = usePanels();
  const { addToast } = useToast();
  const [saved, setSaved] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const linkMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLinkMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (linkMenuRef.current && !linkMenuRef.current.contains(e.target as Node)) {
        setShowLinkMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLinkMenu]);

  const sanitizedHtml = useMemo(() => sanitizeHadithHtml(hadith.text), [hadith.text]);
  const plainText = useMemo(() => hadith.text.replace(/<[^>]+>/g, ""), [hadith.text]);
  const preview = useMemo(() => {
    return plainText.length > 150 ? plainText.slice(0, 150) + "..." : plainText;
  }, [plainText]);
  const parsed = useMemo(() => parseGrade(hadith.grade), [hadith.grade]);
  const hasGrade = parsed !== null;
  const category = parsed ? categorizeGrade(parsed.label) : "unknown";
  const meta = COLLECTION_META[hadith.collection];

  const collectionName = meta?.name?.split(" ").pop() ?? hadith.collection;

  const linkedResource = useMemo<LinkedResource>(() => ({
    type: "hadith",
    label: `${collectionName} #${hadith.hadithNumber}`,
    preview: plainText.slice(0, 200),
    sourceUrl: hadith.reference ?? undefined,
    metadata: {
      collection: hadith.collection,
      hadithNumber: hadith.hadithNumber,
      ...(hadith.grade ? { grade: hadith.grade } : {}),
    },
  }), [collectionName, hadith, plainText]);

  const handleSaveToNotes = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = `${collectionName} Hadith #${hadith.hadithNumber}`;
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
    setSaved(true);
    addToast("Hadith saved to notes", "success");
    setTimeout(() => setSaved(false), 2000);
  }, [collectionName, hadith, plainText, focusedVerseKey, addToast, linkedResource]);

  return (
    <div
      className={cn(
        "group transition-all border border-border",
        expanded ? "bg-background" : "hover:bg-[#fafafa]",
      )}
      style={{ borderLeft: `3px solid ${meta?.accentColor ?? "#666"}` }}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        {/* Hadith number — prominent left column */}
        <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
          <span
            className="font-mono text-[11px] font-bold tabular-nums px-2 py-0.5"
            style={{ backgroundColor: meta?.bg ?? '#f5f5f5', color: meta?.labelColor ?? '#666' }}
          >
            #{hadith.hadithNumber}
          </span>
          {hasGrade && parsed ? (
            <GradePill label={parsed.label} category={category} />
          ) : (
            <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/40">
              N/A
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Narrator — prominent line */}
          {hadith.narratedBy && (
            <p className="text-xs font-medium text-foreground/70 mb-1.5 leading-snug">
              {hadith.narratedBy}
            </p>
          )}

          {/* Preview text — larger, more readable */}
          {!expanded && (
            <p className="text-[14px] leading-[1.75] text-foreground/85 line-clamp-3">
              {preview}
            </p>
          )}

          {/* Topic chips — below preview */}
          {!expanded && hadith.topics && hadith.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {hadith.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider leading-none"
                  style={{ backgroundColor: "#f5f3ff", color: "#8b6fc0" }}
                >
                  {topic}
                </span>
              ))}
              {hadith.topics.length > 3 && (
                <span className="font-mono text-[9px] text-muted-foreground/50">
                  +{hadith.topics.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <CaretDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground/30 mt-0.5 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Full text — generous reading typography */}
          <div
            className="text-[15px] leading-[1.95] text-foreground/90 [&_b]:font-semibold [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />

          {/* Topic chips in expanded view */}
          {hadith.topics && hadith.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hadith.topics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider leading-none"
                  style={{ backgroundColor: "#f5f3ff", color: "#8b6fc0" }}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Metadata footer */}
          <div
            className="border border-border px-4 py-3 space-y-2"
            style={{ backgroundColor: meta?.bg ?? '#fafafa' }}
          >
            {/* Reference line */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <InfoIcon weight="bold" className="h-3 w-3 shrink-0" />
              <span className="font-mono">
                {hadith.inBookReference ?? `Book ${hadith.bookNumber}, Hadith ${hadith.hadithNumber}`}
              </span>
            </div>

            {/* Grade with grader */}
            {parsed && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <GradePill label={parsed.label} category={category} />
                {parsed.grader && (
                  <span className="text-muted-foreground/70 font-mono">
                    graded by {parsed.grader}
                  </span>
                )}
              </div>
            )}

            {/* Actions — compact icon bar matching verse action bar */}
            <div className="flex items-center gap-0 border-t border-border/30 pt-1">
              {hadith.reference && (
                <a
                  href={hadith.reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="View source"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
              <CopyButton text={plainText} />
              <button
                onClick={handleSaveToNotes}
                className={cn(
                  "p-1.5 transition-colors",
                  saved
                    ? "text-foreground bg-[#fefce8]"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface",
                )}
                aria-label={saved ? "Saved" : "Save to notes"}
              >
                {saved ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
                    <path d="M15 3v4a2 2 0 0 0 2 2h4" />
                  </svg>
                )}
              </button>
              <div className="relative" ref={linkMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLinkMenu(!showLinkMenu);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                  aria-label="Link to note"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </button>
                {showLinkMenu && (
                  <div className="absolute left-0 bottom-full z-50 mb-1 border border-border bg-background shadow-md">
                    <LinkHadithToNoteMenu
                      resource={linkedResource}
                      onLinked={() => {
                        setShowLinkMenu(false);
                        addToast("Hadith linked to note", "success");
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function GradePill({ label, category }: { label: string; category: GradeCategory }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none",
        GRADE_STYLES[category],
      )}
    >
      {label}
    </span>
  );
}

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
        "p-1.5 transition-colors",
        copied
          ? "text-foreground bg-[#fefce8]"
          : "text-muted-foreground hover:text-foreground hover:bg-surface",
      )}
      aria-label={copied ? "Copied" : "Copy"}
    >
      {copied ? (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="0" ry="0" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
