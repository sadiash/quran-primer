"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PanelInstance } from "@/core/types/workspace";

const PanelInstanceContext = createContext<PanelInstance | null>(null);

export function PanelInstanceProvider({
  panel,
  children,
}: {
  panel: PanelInstance;
  children: ReactNode;
}) {
  return (
    <PanelInstanceContext.Provider value={panel}>
      {children}
    </PanelInstanceContext.Provider>
  );
}

export function usePanelInstanceContext(): PanelInstance | null {
  return useContext(PanelInstanceContext);
}
