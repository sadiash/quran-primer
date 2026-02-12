"use client";

import Link from "next/link";
import { Button } from "@/presentation/components/ui";

export default function SurahError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold">Failed to load surah</h1>
      <p className="mb-6 text-muted-foreground">
        Something went wrong while loading this surah. Please try again.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/surahs"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-soft-sm transition-smooth hover:bg-secondary/80"
        >
          Browse Surahs
        </Link>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
