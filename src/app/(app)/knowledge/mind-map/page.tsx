"use client";

import { Suspense } from "react";
import { Skeleton } from "@/presentation/components/ui";

function MindMapContent() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">Mind Map</h1>
      <p className="mt-2 text-muted-foreground">
        Visual knowledge connections — coming soon.
      </p>
    </div>
  );
}

export default function MindMapPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <MindMapContent />
    </Suspense>
  );
}
