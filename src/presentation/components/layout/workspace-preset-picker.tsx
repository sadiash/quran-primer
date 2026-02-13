"use client";

import { useRef, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Layout, X } from "lucide-react";
import { useWorkspace, WORKSPACE_PRESETS } from "@/presentation/providers/workspace-provider";

interface WorkspacePresetPickerProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function WorkspacePresetPicker({
  open,
  onClose,
  anchorRef,
}: WorkspacePresetPickerProps) {
  const ws = useWorkspace();
  const menuRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

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
              Workspaces
            </p>
            {WORKSPACE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  ws.applyPreset(preset.id);
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-foreground transition-fast hover:bg-surface-hover"
              >
                <Layout className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 text-left">
                  <span className="font-medium">{preset.label}</span>
                  <p className="text-xs text-muted-foreground">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              onClick={() => {
                ws.closeAllPanels();
                onClose();
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-destructive transition-fast hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
              <span className="font-medium">Close All Panels</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
