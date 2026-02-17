"use client";

import { useState, useCallback, useMemo, type KeyboardEvent } from "react";
import { X, Tag } from "lucide-react";

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
        <Tag className="h-3 w-3 text-muted-foreground/60" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Tags
        </span>
      </div>

      {/* Tag chips + input */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 pb-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="rounded-full p-0.5 hover:bg-primary/20 transition-fast"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-2.5 w-2.5" />
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
              className="rounded-full border border-border/60 bg-surface/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-fast"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
