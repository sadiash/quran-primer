"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/presentation/hooks/use-preferences";

/**
 * Root page — client redirect based on onboarding status.
 * First visit → /onboarding. Returning → /surah/1.
 */
export default function RootPage() {
  const router = useRouter();
  const { preferences, isLoading } = usePreferences();
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoading || redirected.current) return;
    redirected.current = true;
    const target = preferences.onboardingComplete ? "/surah/1" : "/onboarding";
    router.replace(target);
    // Fallback: if router.replace doesn't navigate within 2s, force it
    const timer = setTimeout(() => {
      window.location.replace(target);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoading, preferences.onboardingComplete, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="relative h-14 w-14">
        {/* Spinning ring */}
        <svg className="absolute inset-0 h-14 w-14 animate-spin" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="2" className="text-primary/15" />
          <path
            d="M28 4 a24 24 0 0 1 24 24"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            className="text-primary"
          />
        </svg>
        {/* Logo in center */}
        <svg
          viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 m-auto h-7 w-7 text-primary"
        >
          <rect x="20" y="20" width="40" height="40" rx="2" transform="rotate(45 40 40)" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <rect x="20" y="20" width="40" height="40" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
          <path d="M32 44 L40 39 L48 44" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="40" y1="39" x2="40" y2="48" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          <circle cx="40" cy="34" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground/50">THE PRIMER</p>
    </div>
  );
}
