import { Skeleton } from "@/presentation/components/ui";

export default function SurahLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto h-12 w-48" />
        <Skeleton className="mx-auto mt-2 h-6 w-32" />
        <Skeleton className="mx-auto mt-1 h-4 w-24" />
        <div className="mt-3 flex justify-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Bismillah skeleton */}
      <Skeleton className="mx-auto mb-8 h-8 w-64" />

      {/* Verse line skeletons */}
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="py-4">
          <Skeleton className="ml-auto h-8 w-full max-w-lg" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
        </div>
      ))}
    </div>
  );
}
