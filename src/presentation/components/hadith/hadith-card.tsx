"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowSquareOutIcon, CaretDownIcon, CheckIcon, CopyIcon, InfoIcon, LinkSimpleIcon, NoteIcon } from "@phosphor-icons/react";
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
  const { focusedVerseKey, openPanel } = usePanels();
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
    openPanel("notes");
    setSaved(true);
    addToast("Hadith saved to notes", "success");
    setTimeout(() => setSaved(false), 2000);
  }, [collectionName, hadith, plainText, focusedVerseKey, openPanel, addToast, linkedResource]);

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

        <CaretDownIcon
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
              <InfoIcon className="h-3 w-3 shrink-0" />
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
                  <ArrowSquareOutIcon className="h-3 w-3" />
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
                    <CheckIcon className="h-3 w-3" />
                    Saved
                  </>
                ) : (
                  <>
                    <NoteIcon className="h-3 w-3" />
                    Save to Notes
                  </>
                )}
              </button>
              <div className="relative" ref={linkMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLinkMenu(!showLinkMenu);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  <LinkSimpleIcon className="h-3 w-3" />
                  Link to Note
                </button>
                {showLinkMenu && (
                  <div className="absolute left-0 bottom-full z-50 mb-1 rounded-lg border border-border bg-card shadow-soft-lg animate-scale-in">
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
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
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
        "inline-flex items-center gap-1 text-[10px] transition-colors",
        copied
          ? "text-emerald-500"
          : "text-muted-foreground/60 hover:text-muted-foreground",
      )}
    >
      {copied ? (
        <>
          <CheckIcon className="h-3 w-3" />
          Copied
        </>
      ) : (
        <>
          <CopyIcon className="h-3 w-3" />
          CopyIcon
        </>
      )}
    </button>
  );
}
