import { Skeleton } from "@/presentation/components/ui/skeleton";

export function SurahGridSkeleton() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border border-border bg-background p-4"
        >
          <Skeleton className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
