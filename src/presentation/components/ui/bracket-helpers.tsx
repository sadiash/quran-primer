import { cn } from "@/lib/utils";

export function BracketLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3 block">
      [ {children} ]
    </span>
  );
}

export function RadioOption({
  selected,
  onClick,
  label,
  suffix,
  dotColor,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  suffix?: string;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full bg-transparent border-none cursor-pointer p-0 text-left"
    >
      <span className="flex h-[14px] w-[14px] shrink-0 items-center justify-center border-2 border-foreground rounded-full">
        {selected && (
          <span className="block h-[6px] w-[6px] bg-foreground rounded-full" />
        )}
      </span>
      <span className={cn("font-display text-[13px]", selected ? "text-foreground" : "text-muted-foreground")}>
        {dotColor ? (
          <><span style={{ color: dotColor }}>●</span>{" "}{label.replace("● ", "")}</>
        ) : (
          label
        )}
      </span>
      {suffix && (
        <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground ml-auto">
          {suffix}
        </span>
      )}
    </button>
  );
}
