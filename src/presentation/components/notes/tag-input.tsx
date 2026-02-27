"use client";

import { useState, useCallback, useMemo, type KeyboardEvent } from "react";
import { TagIcon, XIcon } from "@phosphor-icons/react";
import { getTagColor } from "@/lib/surah-colors";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestedTags?: string[];
}

export function TagInput({ tags, onChange, suggestedTags }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        onChange([...tags, tag]);
      }
      setInput("");
    },
    [tags, onChange],
  );

  const removeTag = useCallback(
    (tag: string) => {
      onChange(tags.filter((t) => t !== tag));
    },
    [tags, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(input);
      } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
        onChange(tags.slice(0, -1));
      }
    },
    [input, tags, addTag, onChange],
  );

  // Filter suggested tags to exclude already-selected ones
  const filteredSuggestions = useMemo(() => {
    if (!suggestedTags) return [];
    return suggestedTags.filter((t) => !tags.includes(t));
  }, [suggestedTags, tags]);

  return (
    <div className="px-3 py-2 space-y-1.5">
      {/* Tag chips + input — single row */}
      <div className="flex flex-wrap items-center gap-1.5">
        <TagIcon weight="bold" className="h-3 w-3 text-muted-foreground/40" />
        {tags.map((tag) => {
          const color = getTagColor(tag);
          return (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: color.bg, color: color.label }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="p-0.5 hover:opacity-60 transition-opacity"
                aria-label={`Remove tag ${tag}`}
              >
                <XIcon weight="bold" className="h-2.5 w-2.5" />
              </button>
            </span>
          );
        })}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && addTag(input)}
          placeholder={tags.length === 0 ? "Add tag..." : ""}
          className="min-w-[60px] flex-1 bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/30 outline-none"
        />
      </div>

      {/* Suggested tags — compact */}
      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-muted-foreground/30">Suggested:</span>
          {filteredSuggestions.slice(0, 6).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="border border-border/50 px-1.5 py-0.5 text-[10px] text-muted-foreground/50 hover:border-foreground/30 hover:text-foreground transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
