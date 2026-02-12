"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

export function ContinueReadingCard() {
  return (
    <Link
      href="/surahs/1"
      className="glass rounded-xl p-6 transition-smooth hover:shadow-glow block"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Start Reading</h3>
          <p className="text-sm text-muted-foreground">
            Begin with Al-Fatihah
          </p>
        </div>
      </div>
    </Link>
  );
}
