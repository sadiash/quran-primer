import { AppShell } from "@/presentation/components/layout";
import { WorkspaceProvider } from "@/presentation/providers";
import { CommandPaletteProvider } from "@/presentation/hooks/use-command-palette";
import { CommandPalette } from "@/presentation/components/command-palette/command-palette";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <CommandPaletteProvider>
        <AppShell>{children}</AppShell>
        <CommandPalette />
      </CommandPaletteProvider>
    </WorkspaceProvider>
  );
}
