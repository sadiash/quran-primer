"use client";

import Link from "next/link";
import { usePreferences } from "@/presentation/hooks/use-preferences";

/**
 * Root page — landing with a single CTA.
 * Links to /onboarding (first visit) or /surah/1 (returning).
 */
export default function RootPage() {
  const { preferences, isLoading } = usePreferences();
  const target = !isLoading && preferences.onboardingComplete ? "/surah/1" : "/onboarding";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      {/* Logo */}
      <svg
        viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-primary"
      >
        <rect x="20" y="20" width="40" height="40" rx="2" transform="rotate(45 40 40)" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <rect x="20" y="20" width="40" height="40" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M32 44 L40 39 L48 44" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="40" y1="39" x2="40" y2="48" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <circle cx="40" cy="34" r="1.5" fill="currentColor" />
      </svg>

      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">The Primer</h1>
        <p className="mt-1.5 text-sm text-muted-foreground/70">A personal knowledge system for the Quran</p>
      </div>

      <Link
        href={target}
        className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
      >
        {!isLoading && preferences.onboardingComplete ? "Continue Reading" : "Get Started"}
      </Link>
    </div>
  );
}
