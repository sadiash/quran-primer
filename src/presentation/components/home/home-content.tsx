"use client";

import { useLocalStorage } from "@/presentation/hooks/use-local-storage";
import { OnboardingFlow } from "./onboarding-flow";
import { ContinueReadingCard } from "./continue-reading-card";
import { QuickActions } from "./quick-actions";

export function HomeContent() {
  const [onboarded, setOnboarded] = useLocalStorage("primer:onboarded", false);

  if (!onboarded) {
    return <OnboardingFlow onComplete={() => setOnboarded(true)} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-1 text-muted-foreground">
          Continue your journey with the Quran.
        </p>
      </div>

      <ContinueReadingCard />
      <QuickActions />
    </div>
  );
}
