import { PanelProvider } from "@/presentation/providers";
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
        <AppShell>{children}</AppShell>
      </PanelProvider>
    </TooltipProvider>
  );
}
