"use client";

import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
  type SeparatorProps,
} from "react-resizable-panels";

import { cn } from "@/lib/utils";

type ResizableGroupProps = Omit<GroupProps, "orientation"> & {
  direction: "horizontal" | "vertical";
};

function ResizablePanelGroup({
  className,
  direction,
  ...props
}: ResizableGroupProps) {
  return (
    <Group
      orientation={direction}
      className={cn("flex h-full w-full", className)}
      {...props}
    />
  );
}

const ResizablePanel = Panel;

interface ResizableHandleProps extends SeparatorProps {
  withHandle?: boolean;
  orientation?: "horizontal" | "vertical";
}

function ResizableHandle({
  withHandle,
  className,
  orientation = "horizontal",
  ...props
}: ResizableHandleProps) {
  const isVertical = orientation === "vertical";

  return (
    <Separator
      className={cn(
        "relative flex shrink-0 items-center justify-center bg-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground",
        isVertical
          ? "h-px w-full cursor-row-resize after:absolute after:inset-x-0 after:top-1/2 after:h-2 after:-translate-y-1/2"
          : "h-full w-px cursor-col-resize after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            "z-10 flex items-center justify-center border border-border bg-background",
            isVertical ? "h-3 w-4 rotate-90" : "h-4 w-3",
          )}
        >
          <DotsSixVerticalIcon weight="bold" className="h-2.5 w-2.5" />
        </div>
      )}
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
