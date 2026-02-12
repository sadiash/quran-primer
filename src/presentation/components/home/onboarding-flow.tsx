"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { BookOpen, Sparkles, Palette } from "lucide-react";
import { Button } from "@/presentation/components/ui";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: BookOpen,
    title: "Welcome to The Primer",
    description:
      "Your personal Quran study companion. Read, reflect, and grow — all in one place.",
  },
  {
    icon: Sparkles,
    title: "Powerful Features",
    description:
      "Browse all 114 surahs, read with translations, bookmark verses, and take notes as you study.",
  },
  {
    icon: Palette,
    title: "Choose Your Theme",
    description:
      'Pick the aesthetic that suits you. "The Library" for warm daylight, or "The Observatory" for focused nights.',
  },
] as const;

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const { theme, setTheme } = useTheme();
  const current = steps[step]!;
  const Icon = current.icon;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex max-w-md flex-col items-center text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>

          <h2 className="mb-3 text-2xl font-bold">{current.title}</h2>
          <p className="mb-8 text-muted-foreground">{current.description}</p>

          {step === 2 && (
            <div className="mb-8 flex gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
              >
                The Library
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
              >
                The Observatory
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-smooth ${
                i === step ? "bg-primary w-4" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={() => {
            if (step < steps.length - 1) {
              setStep(step + 1);
            } else {
              onComplete();
            }
          }}
        >
          {step < steps.length - 1 ? "Next" : "Get Started"}
        </Button>
      </div>
    </div>
  );
}
