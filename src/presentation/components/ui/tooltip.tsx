"use client";

import { useState, useRef, useCallback, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
  children: ReactNode;
}

const sideStyles: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({
  content,
  side = "top",
  delayMs = 300,
  children,
  className,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(true), delayMs);
  }, [delayMs]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  }, []);

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...props}
    >
      {children}
      {open && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-70 max-w-xs animate-fade-in",
            "rounded-md bg-foreground px-2.5 py-1 text-xs text-background",
            "shadow-soft-md",
            sideStyles[side]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
