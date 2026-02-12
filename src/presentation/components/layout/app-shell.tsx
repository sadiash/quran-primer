"use client";

import { useState, type ReactNode } from "react";
import { ActivityBar } from "./activity-bar";
import { TopBar } from "./top-bar";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden">
      <ActivityBar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuToggle={() => setSidebarCollapsed((prev) => !prev)} />

        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>

        <div id="audio-dock-slot" />
      </div>

      <MobileNav />
    </div>
  );
}
