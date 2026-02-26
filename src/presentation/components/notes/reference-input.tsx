"use client";

import { useState, useCallback, useRef, type KeyboardEvent } from "react";
import { BookOpenIcon, MapPinIcon, XIcon } from "@phosphor-icons/react";
import { SURAH_NAMES, getSurahName } from "@/lib/surah-names";

interface ReferenceInputProps {
  verseKeys: string[];
  surahIds: number[];
  onChangeVerseKeys: (vks: string[]) => void;
  onChangeSurahIds: (ids: number[]) => void;
}

const VERSE_PATTERN = /^\d{1,3}:\d{1,3}$/;

// Build surah entries for fuzzy search
const SURAH_ENTRIES = Object.entries(SURAH_NAMES).map(([id, name]) => ({
  id: Number(id),
  name,
  lower: name.toLowerCase(),
}));

export function ReferenceInput({
  verseKeys,
  surahIds,
  onChangeVerseKeys,
  onChangeSurahIds,
}: ReferenceInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasRefs = verseKeys.length > 0 || surahIds.length > 0;

  const addVerseKey = useCallback(
    (raw: string) => {
      const vk = raw.trim();
      if (VERSE_PATTERN.test(vk) && !verseKeys.includes(vk)) {
        const parts = vk.split(":").map(Number);
        const s = parts[0] ?? 0;
        const v = parts[1] ?? 0;
        if (s >= 1 && s <= 114 && v >= 1) {
          onChangeVerseKeys([...verseKeys, vk]);
        }
      }
      setInput("");
      setSuggestions([]);
    },
    [verseKeys, onChangeVerseKeys],
  );

  const addSurahId = useCallback(
    (id: number) => {
      if (!surahIds.includes(id)) {
        onChangeSurahIds([...surahIds, id]);
      }
      setInput("");
      setSuggestions([]);
    },
    [surahIds, onChangeSurahIds],
  );

  const removeVerseKey = useCallback(
    (vk: string) => {
      onChangeVerseKeys(verseKeys.filter((v) => v !== vk));
    },
    [verseKeys, onChangeVerseKeys],
  );

  const removeSurahId = useCallback(
    (id: number) => {
      onChangeSurahIds(surahIds.filter((s) => s !== id));
    },
    [surahIds, onChangeSurahIds],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      const q = value.trim().toLowerCase();
      if (q.length === 0 || VERSE_PATTERN.test(q)) {
        setSuggestions([]);
        setSelectedIdx(0);
        return;
      }
      // Fuzzy match surah names
      const matches = SURAH_ENTRIES.filter(
        (e) => e.lower.includes(q) || String(e.id) === q,
      ).slice(0, 6);
      setSuggestions(matches);
      setSelectedIdx(0);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (suggestions.length > 0 && suggestions[selectedIdx]) {
          addSurahId(suggestions[selectedIdx].id);
        } else if (input.trim()) {
          addVerseKey(input);
        }
      } else if (e.key === "ArrowDown" && suggestions.length > 0) {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp" && suggestions.length > 0) {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Escape") {
        setSuggestions([]);
      } else if (
        e.key === "Backspace" &&
        input === ""
      ) {
        // Remove last chip
        if (surahIds.length > 0) {
          onChangeSurahIds(surahIds.slice(0, -1));
        } else if (verseKeys.length > 0) {
          onChangeVerseKeys(verseKeys.slice(0, -1));
        }
      }
    },
    [
      input,
      suggestions,
      selectedIdx,
      verseKeys,
      surahIds,
      addVerseKey,
      addSurahId,
      onChangeVerseKeys,
      onChangeSurahIds,
    ],
  );

  return (
    <div className="space-y-1">
      {/* Section header */}
      <div className="flex items-center gap-1.5 px-3 pt-2">
        <MapPinIcon className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Linked Passages
        </span>
      </div>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
          {/* Verse key chips */}
          {verseKeys.map((vk) => {
            const [s, v] = vk.split(":");
            return (
              <span
                key={`vk-${vk}`}
                className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                <BookOpenIcon className="h-2.5 w-2.5 text-muted-foreground" />
                {getSurahName(Number(s))} {s}:{v}
                <button
                  type="button"
                  onClick={() => removeVerseKey(vk)}
                  className="rounded-full p-0.5 hover:bg-accent/30 transition-fast"
                  aria-label={`Remove ${vk}`}
                >
                  <XIcon className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}

          {/* Surah ID chips */}
          {surahIds.map((id) => (
            <span
              key={`s-${id}`}
              className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              <BookOpenIcon className="h-2.5 w-2.5" />
              {getSurahName(id)} (surah)
              <button
                type="button"
                onClick={() => removeSurahId(id)}
                className="rounded-full p-0.5 hover:bg-primary/20 transition-fast"
                aria-label={`Remove surah ${id}`}
              >
                <XIcon className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type verse like 2:255 or surah name..."
            className="min-w-[120px] flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
        </div>

        {/* Helper text when empty */}
        {!hasRefs && !input && (
          <p className="px-3 pb-2 text-[10px] text-muted-foreground/40">
            Link this note to specific verses or entire surahs
          </p>
        )}

        {/* Surah suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-card p-1 shadow-soft-lg">
            {suggestions.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addSurahId(s.id);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-fast ${
                  i === selectedIdx
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <BookOpenIcon className="h-3 w-3" />
                <span>
                  {s.name}{" "}
                  <span className="text-muted-foreground/60">
                    (Surah {s.id})
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
