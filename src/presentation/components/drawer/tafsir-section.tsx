"use client";

import { useState, useMemo } from "react";
import DOMPurify from "dompurify";
import { Loader2, Copy, Check, BookOpen } from "lucide-react";
import { useFetch } from "@/presentation/hooks/use-fetch";
import { usePanels } from "@/presentation/providers/panel-provider";
import type { Tafsir } from "@/core/types";
import { cn } from "@/lib/utils";

const TAFSIR_RESOURCES = [
  { id: 74, name: "Al-Jalalayn", authorName: "Jalal ad-Din al-Mahalli & as-Suyuti", accent: "border-l-emerald-400", bg: "bg-emerald-500/5", chip: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20" },
  { id: 169, name: "Ibn Kathir (Abridged)", authorName: "Ibn Kathir", accent: "border-l-amber-400", bg: "bg-amber-500/5", chip: "bg-amber-500/15 text-amber-400 ring-amber-500/20" },
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
  const [activeTafsirIds, setActiveTafsirIds] = useState<number[]>([TAFSIR_RESOURCES[0].id]);

  if (!focusedVerseKey) {
    return (
      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
        <BookOpen className="h-6 w-6 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground/60">
          Click a verse to view its tafsir
        </p>
      </div>
    );
  }

  const toggleTafsir = (id: number) => {
    setActiveTafsirIds((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((x) => x !== id) : prev
        : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Scholar selector */}
      <div className="shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Verse <span className="font-mono text-foreground">{focusedVerseKey}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TAFSIR_RESOURCES.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleTafsir(r.id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-fast ring-1",
                activeTafsirIds.includes(r.id)
                  ? r.chip
                  : "text-muted-foreground/60 ring-border/30 hover:bg-surface-hover hover:text-muted-foreground",
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tafsir content */}
      <div className="space-y-4">
        {activeTafsirIds.map((tafsirId) => (
          <TafsirContent
            key={tafsirId}
            tafsirId={tafsirId}
            verseKey={focusedVerseKey}
            showHeader={activeTafsirIds.length > 1}
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
  const url = `/api/v1/tafsir?verse_key=${verseKey}&tafsir_id=${tafsirId}`;
  const fetchKey = `${verseKey}:${tafsirId}`;
  const { data: tafsir, error, isLoading } = useFetch<Tafsir>(url, fetchKey);
  const [copied, setCopied] = useState(false);

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

  const accentClass = resource?.accent ?? "border-l-primary/30";
  const bgClass = resource?.bg ?? "";

  return (
    <div
      className={cn(
        "rounded-lg border-l-[3px] p-4",
        accentClass,
        bgClass,
      )}
    >
      {/* Always show scholar header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{resource?.name}</p>
          <p className="text-[11px] text-muted-foreground/70">{resource?.authorName}</p>
        </div>
        {tafsir && (
          <button
            onClick={handleCopy}
            className="rounded-md p-1.5 text-muted-foreground transition-fast hover:bg-surface-hover"
            aria-label="Copy tafsir text"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
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
            "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/20 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground/80",
            "[&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4",
            "[&_li]:mb-1",
          )}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      )}

      {!isLoading && !error && !tafsir && (
        <p className="text-xs text-muted-foreground/70 italic">
          No tafsir available for this verse.
        </p>
      )}
    </div>
  );
}
