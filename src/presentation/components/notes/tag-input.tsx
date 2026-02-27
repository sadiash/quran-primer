"use client";

import { useState, useCallback, useMemo, type KeyboardEvent } from "react";
import { TagIcon, XIcon } from "@phosphor-icons/react";

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
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-1.5 px-3 pt-2">
        <TagIcon weight="bold" className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Tags
        </span>
      </div>

      {/* Tag chips + input */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 pb-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: '#f5f3ff', color: '#8b6fc0' }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="p-0.5 hover:bg-[#f5f3ff] transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <XIcon weight="bold" className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && addTag(input)}
          placeholder={tags.length === 0 ? "Add tag..." : ""}
          className="min-w-[80px] flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none"
        />
      </div>

      {/* Suggested tags */}
      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
          <span className="text-[10px] text-muted-foreground/50">Suggested:</span>
          {filteredSuggestions.slice(0, 8).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="border border-border px-2 py-0.5 text-[10px] text-muted-foreground hover:border-foreground/30 hover:bg-[#fafafa] hover:text-foreground transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
