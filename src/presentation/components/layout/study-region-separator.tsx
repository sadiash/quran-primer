"use client";

import { Separator } from "react-resizable-panels";
import { cn } from "@/lib/utils";

interface StudyRegionSeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function StudyRegionSeparator({
  orientation = "horizontal",
  className,
}: StudyRegionSeparatorProps) {
  const isVertical = orientation === "vertical";

  return (
    <Separator
      className={cn(
        "group relative flex items-center justify-center transition-fast",
        isVertical
          ? "w-px cursor-col-resize hover:bg-primary/20"
          : "h-px cursor-row-resize hover:bg-primary/20",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-full bg-border transition-fast",
          "group-hover:bg-primary/50 group-data-[resize-handle-active]:bg-primary",
          isVertical ? "h-8 w-1" : "h-1 w-8",
        )}
      />
    </Separator>
  );
}
