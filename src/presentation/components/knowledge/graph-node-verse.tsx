"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VerseNodeData {
  label: string;
  verseKey?: string;
  surahId?: number;
  metadata?: Record<string, unknown>;
}

/** Hash a surah ID to a consistent HSL hue for color-coding */
function surahHue(surahId: number): number {
  return (surahId * 137) % 360;
}

export function GraphNodeVerse({ data, selected }: NodeProps) {
  const nodeData = data as unknown as VerseNodeData;
  const hue = nodeData.surahId ? surahHue(nodeData.surahId) : 200;

  return (
    <div
      className={cn(
        "rounded-lg border bg-background/80 backdrop-blur-sm px-3 py-2 shadow-sm transition-shadow min-w-[100px]",
        selected ? "ring-2 ring-primary shadow-md" : "hover:shadow-md",
      )}
      style={{ borderColor: `hsl(${hue}, 50%, 60%)` }}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ backgroundColor: `hsl(${hue}, 50%, 90%)` }}
        >
          <BookOpen className="h-3.5 w-3.5" style={{ color: `hsl(${hue}, 50%, 40%)` }} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{nodeData.verseKey ?? nodeData.label}</p>
          {nodeData.surahId && (
            <p className="text-[10px] text-muted-foreground leading-tight">Surah {nodeData.surahId}</p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
}
