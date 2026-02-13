"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemeNodeData {
  label: string;
  metadata?: Record<string, unknown>;
}

export function GraphNodeTheme({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ThemeNodeData;

  return (
    <div
      className={cn(
        "rounded-full border border-primary/50 bg-primary/10 backdrop-blur-sm px-4 py-1.5 shadow-sm transition-shadow",
        selected ? "ring-2 ring-primary shadow-md" : "hover:shadow-md",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-2 !h-2" />
      <div className="flex items-center gap-1.5">
        <Tag className="h-3 w-3 text-primary" />
        <p className="text-xs font-medium text-primary">{nodeData.label}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-2 !h-2" />
    </div>
  );
}
