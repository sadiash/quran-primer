"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { LogoIcon } from "@/presentation/components/layout/logo";

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
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="animate-pulse">
        <LogoIcon className="h-12 w-12 text-primary" />
      </div>
      <p className="text-sm font-medium text-muted-foreground/60">Loading...</p>
    </div>
  );
}
