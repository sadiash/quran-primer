"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/presentation/components/ui";

export interface NoteNodeData {
  label: string;
  verseKey?: string;
  metadata?: Record<string, unknown>;
}

export function GraphNodeNote({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NoteNodeData;
  const tags =
    nodeData.metadata && Array.isArray(nodeData.metadata.tags)
      ? (nodeData.metadata.tags as string[])
      : [];

  return (
    <div
      className={cn(
        "rounded-lg border border-amber-400/60 bg-background/80 backdrop-blur-sm px-3 py-2 shadow-sm transition-shadow min-w-[120px] max-w-[200px]",
        selected ? "ring-2 ring-amber-400 shadow-md" : "hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <div className="flex items-start gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
          <StickyNote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs leading-snug line-clamp-2">{nodeData.label}</p>
          {tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
}
