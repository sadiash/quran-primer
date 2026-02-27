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
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6">
      {/* Logo mark */}
      <svg
        viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="h-14 w-14 text-foreground"
      >
        <rect x="20" y="20" width="40" height="40" rx="0" transform="rotate(45 40 40)" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <rect x="20" y="20" width="40" height="40" rx="0" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M32 44 L40 39 L48 44" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="square" strokeLinejoin="miter" />
        <line x1="40" y1="39" x2="40" y2="48" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <circle cx="40" cy="34" r="1.5" fill="currentColor" />
      </svg>

      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground uppercase">
          The Primer
        </h1>
        <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          A personal knowledge system for the Quran
        </p>
      </div>

      <Link
        href={target}
        className="px-10 py-3 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:opacity-80"
        style={{ backgroundColor: '#e8e337' }}
      >
        {!isLoading && preferences.onboardingComplete ? "Continue Reading" : "Get Started"}
      </Link>
    </div>
  );
}
