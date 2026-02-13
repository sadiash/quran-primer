"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Search, X } from "lucide-react";
import type { TranslationResource } from "@/core/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/presentation/components/ui";

interface TranslationSelectorProps {
  activeIds: number[];
  onToggle: (id: number) => void;
}

async function fetchAvailableTranslations(): Promise<TranslationResource[]> {
  const res = await fetch("/api/v1/translations");
  if (!res.ok) return [];
  const json = await res.json();
  return json.ok ? json.data : [];
}

export function TranslationSelector({
  activeIds,
  onToggle,
}: TranslationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: available = [], isLoading } = useQuery({
    queryKey: ["available-translations"],
    queryFn: fetchAvailableTranslations,
    staleTime: 10 * 60 * 1000,
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const filtered = search
    ? available.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.authorName.toLowerCase().includes(search.toLowerCase()),
      )
    : available;

  // Group by language
  const englishTranslations = filtered.filter(
    (t) => t.languageCode.toLowerCase() === "english",
  );
  const otherTranslations = filtered.filter(
    (t) => t.languageCode.toLowerCase() !== "english",
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-smooth",
          "glass shadow-soft-sm hover:shadow-soft-md",
          open && "ring-2 ring-primary/30",
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select translations"
      >
        Translations
        <Badge variant="secondary" className="ml-0.5 h-4 min-w-4 px-1 text-[10px]">
          {activeIds.length}
        </Badge>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl glass shadow-soft-lg"
          role="listbox"
          aria-label="Available translations"
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search translations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto p-1">
            {isLoading && (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                Loading translations...
              </p>
            )}

            {!isLoading && filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                No translations found
              </p>
            )}

            {englishTranslations.length > 0 && (
              <>
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  English
                </p>
                {englishTranslations.map((t) => (
                  <TranslationOption
                    key={t.id}
                    resource={t}
                    isActive={activeIds.includes(t.id)}
                    onToggle={() => onToggle(t.id)}
                  />
                ))}
              </>
            )}

            {otherTranslations.length > 0 && (
              <>
                <p className="mt-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Other Languages
                </p>
                {otherTranslations.map((t) => (
                  <TranslationOption
                    key={t.id}
                    resource={t}
                    isActive={activeIds.includes(t.id)}
                    onToggle={() => onToggle(t.id)}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TranslationOption({
  resource,
  isActive,
  onToggle,
}: {
  resource: TranslationResource;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      role="option"
      aria-selected={isActive}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-smooth",
        isActive
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
      )}
    >
      <div
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border transition-smooth",
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border",
        )}
      >
        {isActive && <Check className="h-3 w-3" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{resource.name}</p>
        <p className="truncate text-[10px] text-muted-foreground/70">
          {resource.authorName}
        </p>
      </div>
    </button>
  );
}
