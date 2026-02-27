"use client";

import { useState, useMemo, useCallback } from "react";
import DOMPurify from "dompurify";
import { BookOpenIcon, CheckIcon, CircleNotchIcon, CopyIcon, NoteIcon } from "@phosphor-icons/react";
import { useFetch } from "@/presentation/hooks/use-fetch";
import { usePanels } from "@/presentation/providers/panel-provider";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { useToast } from "@/presentation/components/ui/toast";
import { db } from "@/infrastructure/db/client";
import type { Tafsir } from "@/core/types";
import type { LinkedResource } from "@/core/types/study";
import { cn } from "@/lib/utils";
import { PanelBreadcrumb } from "@/presentation/components/panels/panel-breadcrumb";

const TAFSIR_RESOURCES = [
  { id: 74, name: "Al-Jalalayn", authorName: "Jalal ad-Din al-Mahalli & as-Suyuti", border: "var(--surah-teal-accent)", bg: "var(--surah-teal-bg)", label: "var(--surah-teal-label)" },
  { id: 169, name: "Ibn Kathir (Abridged)", authorName: "Ibn Kathir", border: "var(--surah-yellow-accent)", bg: "var(--surah-yellow-bg)", label: "var(--surah-yellow-label)" },
  { id: 817, name: "Tazkirul Quran", authorName: "Maulana Wahiduddin Khan", border: "var(--surah-lavender-accent)", bg: "var(--surah-lavender-bg)", label: "var(--surah-lavender-label)" },
] as const;

function sanitize(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "b", "i", "em", "strong", "span", "sup", "sub", "h3", "h4", "ul", "ol", "li", "blockquote"],
    ALLOWED_ATTR: ["class"],
  });
}

/**
 * Fix common transliteration encoding issues in tafsir text.
 * Normalizes mangled UTF-8 characters and improves readability.
 */
function fixTransliteration(html: string): string {
  return html
    // Fix mojibake: common double-encoded patterns
    .replace(/Ã¢/g, "â").replace(/Ã©/g, "é").replace(/Ã®/g, "î")
    .replace(/Ã¡/g, "á").replace(/Ã­/g, "í").replace(/Ãº/g, "ú")
    // Normalize uppercase macron to lowercase (Ā→ā, Ī→ī, Ū→ū)
    .replace(/\u0100/g, "\u0101") // Ā → ā
    .replace(/\u012A/g, "\u012B") // Ī → ī
    .replace(/\u016A/g, "\u016B") // Ū → ū
    // Add paragraph breaks at sentence boundaries for dense text
    // (only if no <p> tags already exist in the text)
    ;
}

/**
 * Break a long tafsir paragraph into readable sections.
 * Wraps text in <p> tags at natural break points.
 */
function formatTafsirText(html: string): string {
  // If text already contains block-level HTML, don't reformat
  if (/<(p|h[1-6]|ul|ol|blockquote|div)/i.test(html)) return html;

  // Split on semicolons followed by space (common tafsir sentence separator)
  const segments = html.split(/;\s+/);
  if (segments.length <= 1) return html;

  return segments
    .map((s) => `<p>${s.trim()}${s.trim().endsWith(";") ? "" : ";"}</p>`)
    .join("");
}

export function TafsirSection() {
  const { focusedVerseKey } = usePanels();
  const { preferences } = usePreferences();
  const enabledResources = TAFSIR_RESOURCES.filter((r) => preferences.activeTafsirIds.includes(r.id));
  const [visibleIds, setVisibleIds] = useState<number[]>(() => {
    const first = enabledResources[0];
    return first ? [first.id] : [];
  });

  // Keep visibleIds in sync when settings change
  const validVisibleIds = visibleIds.filter((id) => enabledResources.some((r) => r.id === id));
  const firstEnabled = enabledResources[0];
  const displayIds = validVisibleIds.length > 0
    ? validVisibleIds
    : firstEnabled ? [firstEnabled.id] : [];

  if (!focusedVerseKey) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <BookOpenIcon weight="duotone" className="h-6 w-6 text-muted-foreground/20" />
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Click a verse to view its tafsir
        </p>
      </div>
    );
  }

  const toggleVisible = (id: number) => {
    setVisibleIds((prev) => {
      const validPrev = prev.filter((x) => enabledResources.some((r) => r.id === x));
      if (validPrev.includes(id)) {
        return validPrev.length > 1 ? validPrev.filter((x) => x !== id) : validPrev;
      }
      return [...validPrev, id];
    });
  };

  const displayNames = displayIds
    .map((id) => enabledResources.find((r) => r.id === id)?.name)
    .filter(Boolean)
    .join(" + ");

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Breadcrumb */}
      <PanelBreadcrumb items={[
        { label: focusedVerseKey },
        { label: displayNames || "Tafsir" },
      ]} />

      {/* Scholar pills — only show enabled tafsirs from settings */}
      {enabledResources.length > 1 && (
        <div className="shrink-0 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {enabledResources.map((r) => {
              const isActive = displayIds.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleVisible(r.id)}
                  className="px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors"
                  style={isActive ? {
                    backgroundColor: r.bg,
                    borderLeft: `3px solid ${r.border}`,
                    color: r.label,
                  } : {
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                >
                  {r.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tafsir content */}
      <div className="space-y-4">
        {displayIds.map((tafsirId) => (
          <TafsirContent
            key={tafsirId}
            tafsirId={tafsirId}
            verseKey={focusedVerseKey}
            showHeader={displayIds.length > 1}
          />
        ))}
      </div>
    </div>
  );
}

function TafsirContent({
  tafsirId,
  verseKey,
  showHeader,
}: {
  tafsirId: number;
  verseKey: string;
  showHeader: boolean;
}) {
  const { openPanel } = usePanels();
  const { addToast } = useToast();
  const url = `/api/v1/tafsir?verse_key=${verseKey}&tafsir_id=${tafsirId}`;
  const fetchKey = `${verseKey}:${tafsirId}`;
  const { data: tafsir, error, isLoading } = useFetch<Tafsir>(url, fetchKey);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const resource = TAFSIR_RESOURCES.find((r) => r.id === tafsirId);
  const tafsirText = tafsir?.text ?? "";
  const sanitizedHtml = useMemo(() => {
    if (!tafsirText) return "";
    const fixed = fixTransliteration(tafsirText);
    const formatted = formatTafsirText(fixed);
    return sanitize(formatted);
  }, [tafsirText]);

  const handleCopy = async () => {
    if (!tafsir) return;
    const plain = tafsir.text.replace(/<[^>]+>/g, "");
    await navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tafsirName = resource?.name ?? "Tafsir";

  const handleSaveToNotes = useCallback(async () => {
    if (!tafsir) return;
    const plainText = tafsir.text.replace(/<[^>]+>/g, "");
    const title = `${tafsirName} on ${verseKey}`;
    const linkedResource: LinkedResource = {
      type: "tafsir",
      label: `${tafsirName} on ${verseKey}`,
      preview: plainText.slice(0, 200),
      metadata: {
        tafsirId: String(tafsirId),
        tafsirName,
      },
    };
    const now = new Date();
    await db.notes.put({
      id: crypto.randomUUID(),
      title,
      verseKeys: [verseKey],
      surahIds: [],
      content: plainText,
      tags: ["tafsir", tafsirName.toLowerCase()],
      pinned: false,
      linkedResources: [linkedResource],
      createdAt: now,
      updatedAt: now,
    });
    openPanel("notes");
    setSaved(true);
    addToast("Tafsir excerpt saved to notes", "success");
    setTimeout(() => setSaved(false), 2000);
  }, [tafsir, tafsirName, verseKey, tafsirId, openPanel, addToast]);

  return (
    <div
      className="border border-border p-4"
      style={{ borderLeft: `3px solid ${resource?.border ?? '#78d5c4'}` }}
    >
      {/* Scholar header with colored accent */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider" style={{ color: resource?.label }}>{resource?.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{resource?.authorName}</p>
        </div>
        <div className="flex items-center gap-1">
          {tafsir && (
            <button
              onClick={handleSaveToNotes}
              className={cn(
                "p-1.5 transition-colors",
                saved
                  ? "text-emerald-500"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Save tafsir to notes"
              title="Save to Notes"
            >
              {saved ? <CheckIcon weight="fill" className="h-3.5 w-3.5" /> : <NoteIcon weight="bold" className="h-3.5 w-3.5" />}
            </button>
          )}
          {tafsir && (
            <button
              onClick={handleCopy}
              className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Copy tafsir text"
            >
              {copied ? <CheckIcon weight="fill" className="h-3.5 w-3.5 text-emerald-500" /> : <CopyIcon weight="bold" className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <CircleNotchIcon weight="bold" className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="border-2 border-destructive bg-destructive/5 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && tafsir && (
        <div
          className={cn(
            "tafsir-prose text-[13px] leading-[1.85] text-muted-foreground",
            "[&_p]:mb-2 [&_p:last-child]:mb-0",
            "[&_b]:text-foreground [&_b]:font-medium",
            "[&_strong]:text-foreground [&_strong]:font-medium",
            "[&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:mt-3 [&_h3]:mb-1",
            "[&_h4]:text-foreground [&_h4]:font-medium [&_h4]:text-[13px] [&_h4]:mt-2 [&_h4]:mb-1",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-foreground/20 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground/80",
            "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4",
            "[&_li]:mb-1",
          )}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      )}

      {!isLoading && !error && !tafsir && (
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          No tafsir available for this verse.
        </p>
      )}
    </div>
  );
}
