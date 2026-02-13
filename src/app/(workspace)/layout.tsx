import { AppShell } from "@/presentation/components/layout";
import { PanelProvider } from "@/presentation/providers";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PanelProvider>
      <AppShell>{children}</AppShell>
    </PanelProvider>
  );
}
