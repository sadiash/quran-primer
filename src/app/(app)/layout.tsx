import { PanelProvider } from "@/presentation/providers";
import { CommandPaletteProvider } from "@/presentation/hooks/use-command-palette";
import { CommandPalette } from "@/presentation/components/command-palette/command-palette";
import { AppShell } from "@/presentation/components/layout";
import { TooltipProvider } from "@/presentation/components/ui/tooltip";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <PanelProvider>
        <CommandPaletteProvider>
          <AppShell>{children}</AppShell>
          <CommandPalette />
        </CommandPaletteProvider>
      </PanelProvider>
    </TooltipProvider>
  );
}
