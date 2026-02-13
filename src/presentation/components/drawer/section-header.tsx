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
        "sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-2",
        className,
      )}
    >
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
        {title}
      </span>
    </div>
  );
}
