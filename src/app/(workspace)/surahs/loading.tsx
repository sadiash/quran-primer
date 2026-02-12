import { SurahGridSkeleton } from "@/presentation/components/quran";
import { Skeleton } from "@/presentation/components/ui";

export default function SurahsLoading() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <Skeleton className="mb-6 h-8 w-32" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-9 flex-1" />
        <div className="flex gap-1.5">
          <Skeleton className="h-7 w-12 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>
      <SurahGridSkeleton />
    </div>
  );
}
