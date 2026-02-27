import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  className?: string;
}

/**
 * Sticky section header used in the mobile study sheet.
 */
export function SectionHeader({ icon: Icon, title, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background px-4 py-2",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
        [ {title} ]
      </span>
    </div>
  );
}
