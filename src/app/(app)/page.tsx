"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/presentation/hooks/use-preferences";

/**
 * Root page — client redirect based on onboarding status.
 * First visit → /onboarding. Returning → /surah/1.
 */
export default function RootPage() {
  const router = useRouter();
  const { preferences, isLoading } = usePreferences();

  useEffect(() => {
    if (isLoading) return;
    if (preferences.onboardingComplete) {
      router.replace("/surah/1");
    } else {
      router.replace("/onboarding");
    }
  }, [isLoading, preferences.onboardingComplete, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
