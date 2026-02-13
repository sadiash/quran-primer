"use client";

import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWorkspace, PANEL_REGISTRY } from "@/presentation/providers/workspace-provider";
import type { PanelKind } from "@/core/types/workspace";

const PANEL_KINDS: PanelKind[] = [
  "tafsir",
  "hadith",
  "notes",
  "crossref",
  "knowledge-graph",
  "context-preview",
];

interface AddPanelMenuProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function AddPanelMenu({ open, onClose, anchorRef }: AddPanelMenuProps) {
  const ws = useWorkspace();
  const menuRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSelect = (kind: PanelKind) => {
    ws.addPanel(kind);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-border glass shadow-soft-lg z-50"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
        >
          <div className="p-1.5">
            <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Open Panel
            </p>
            {PANEL_KINDS.map((kind) => {
              const info = PANEL_REGISTRY[kind];
              const Icon = info.icon;
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => handleSelect(kind)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground transition-fast hover:bg-surface-hover"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <span className="font-medium">{info.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
