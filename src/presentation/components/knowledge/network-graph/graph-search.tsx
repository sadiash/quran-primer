"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import type { SimulationNode } from "@/core/types";

interface GraphSearchProps {
  nodes: SimulationNode[];
  onSearchResults: (matchedIds: Set<string> | null) => void;
}

export function GraphSearch({ nodes, onSearchResults }: GraphSearchProps) {
  const [query, setQuery] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        onSearchResults(null);
        setMatchCount(null);
        return;
      }
      const lower = q.toLowerCase();
      const matched = new Set<string>();
      for (const n of nodes) {
        if (n.label.toLowerCase().includes(lower) || n.id.toLowerCase().includes(lower)) {
          matched.add(n.id);
        }
      }
      onSearchResults(matched);
      setMatchCount(matched.size);
    },
    [nodes, onSearchResults],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-2 size-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search nodes..."
        className="w-44 pl-7 pr-7 py-1 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {query && (
        <button
          onClick={() => {
            setQuery("");
            onSearchResults(null);
            setMatchCount(null);
          }}
          className="absolute right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      )}
      {matchCount !== null && (
        <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
          {matchCount} of {nodes.length}
        </span>
      )}
    </div>
  );
}
