"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createElement } from "react";

const RECENT_KEY = "command-palette:recent";
const MAX_RECENT = 5;

function getRecentCommands(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentCommands(ids: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)));
  } catch {
    // localStorage may be unavailable
  }
}

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  recentCommandIds: string[];
  addRecentCommand: (commandId: string) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [recentCommandIds, setRecentCommandIds] = useState<string[]>(
    getRecentCommands,
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  const addRecentCommand = useCallback((commandId: string) => {
    setRecentCommandIds((prev) => {
      const next = [commandId, ...prev.filter((id) => id !== commandId)].slice(
        0,
        MAX_RECENT,
      );
      saveRecentCommands(next);
      return next;
    });
  }, []);

  const value: CommandPaletteContextValue = {
    open,
    setOpen,
    toggle,
    recentCommandIds,
    addRecentCommand,
  };

  return createElement(CommandPaletteContext.Provider, { value }, children);
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used within a CommandPaletteProvider",
    );
  }
  return ctx;
}
