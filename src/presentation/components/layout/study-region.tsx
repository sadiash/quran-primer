"use client";

import { Panel, Group, Separator } from "react-resizable-panels";
import { useWorkspace } from "@/presentation/providers/workspace-provider";
import { PanelGroupContainer } from "./panel-group-container";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

function GroupSeparator() {
  return (
    <Separator
      className={cn(
        "group relative flex items-center justify-center transition-fast",
        "w-px cursor-col-resize hover:bg-primary/20",
      )}
    >
      <div className="h-8 w-1 rounded-full bg-border transition-fast group-hover:bg-primary/50 group-data-[resize-handle-active]:bg-primary" />
    </Separator>
  );
}

export function StudyRegion() {
  const ws = useWorkspace();
  const { studyGroups } = ws.state;

  if (studyGroups.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 border-l border-border bg-background p-6 text-center text-muted-foreground">
        <BookOpen className="h-10 w-10 opacity-40" />
        <p className="text-sm">Select a verse to begin studying</p>
      </div>
    );
  }

  if (studyGroups.length === 1) {
    return <PanelGroupContainer group={studyGroups[0]!} />;
  }

  return (
    <Group orientation="horizontal" id="study-groups">
      {studyGroups.map((group, i) => (
        <>
          {i > 0 && <GroupSeparator key={`sep-${group.id}`} />}
          <Panel
            key={group.id}
            id={group.id}
            defaultSize={group.sizePercent}
            minSize={15}
          >
            <PanelGroupContainer group={group} />
          </Panel>
        </>
      ))}
    </Group>
  );
}
