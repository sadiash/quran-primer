"use client";

import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ActivityBar } from "./activity-bar";
import { TopBar } from "./top-bar";
import { MobileNav } from "./mobile-nav";
import { AudioDock } from "./audio-dock";
import { useAudioPlayer } from "@/presentation/providers/audio-provider";
import { CommandPalette } from "@/presentation/components/ui/command-palette";
import { useCommandPalette } from "@/presentation/hooks/use-command-palette";
import type { Surah, ApiResponse } from "@/core/types";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isActive: audioActive } = useAudioPlayer();
  const { open, setOpen, toggle, recentCommandIds, addRecentCommand } =
    useCommandPalette();

  const { data: surahs = [] } = useQuery({
    queryKey: ["surahs"],
    queryFn: async () => {
      const res = await fetch("/api/v1/surahs");
      const json = (await res.json()) as ApiResponse<Surah[]>;
      if (!json.ok) throw new Error(json.error.message);
      return json.data;
    },
    staleTime: Infinity,
  });

  return (
    <div className="flex h-dvh overflow-hidden">
      <ActivityBar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          onMenuToggle={() => setSidebarCollapsed((prev) => !prev)}
          onCommandPalette={toggle}
        />

        <main
          id="main-content"
          className={`flex-1 overflow-y-auto pb-16 md:pb-0 ${
            audioActive ? "pb-28 md:pb-14" : ""
          }`}
        >
          {children}
        </main>

        <div id="audio-dock-slot" />
      </div>

      <MobileNav />
      <AudioDock />

      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        surahs={surahs}
        recentCommandIds={recentCommandIds}
        onCommandExecuted={addRecentCommand}
      />
    </div>
  );
}
