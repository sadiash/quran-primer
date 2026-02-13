"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, BookOpenText } from "lucide-react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { cn } from "@/lib/utils";

const TRANSLATIONS = [
  { id: 1001, name: "The Clear Quran", author: "Mustafa Khattab" },
  { id: 1002, name: "Abdullah Yusuf Ali", author: "Abdullah Yusuf Ali" },
  { id: 1003, name: "Marmaduke Pickthall", author: "M.M.W. Pickthall" },
  { id: 1004, name: "Al-Hilali & Khan", author: "Al-Hilali & Muhsin Khan" },
  { id: 1005, name: "Abdel Haleem", author: "M.A.S. Abdel Haleem" },
  { id: 1006, name: "Tafhim-ul-Quran", author: "Abul Ala Maududi" },
];

const TAFSIRS = [
  { id: 74, name: "Al-Jalalayn", author: "Al-Mahalli & as-Suyuti" },
  { id: 169, name: "Ibn Kathir", author: "Ibn Kathir (Abridged)" },
];

const HADITH_COLLECTIONS = [
  { id: "bukhari", name: "Sahih al-Bukhari" },
  { id: "muslim", name: "Sahih Muslim" },
  { id: "abudawud", name: "Sunan Abu Dawud" },
  { id: "tirmidhi", name: "Jami' at-Tirmidhi" },
];

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { updatePreferences } = usePreferences();
  const [step, setStep] = useState(0);

  // Selection state
  const [showArabic, setShowArabic] = useState(true);
  const [arabicFont, setArabicFont] = useState<"uthmani" | "simple">("uthmani");
  const [selectedTranslations, setSelectedTranslations] = useState<number[]>([1001]);
  const [selectedTafsirs, setSelectedTafsirs] = useState<number[]>([74]);
  const [selectedHadith, setSelectedHadith] = useState<string[]>(["bukhari", "muslim"]);

  const toggleTranslation = (id: number) => {
    setSelectedTranslations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleTafsir = (id: number) => {
    setSelectedTafsirs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleHadith = (id: string) => {
    setSelectedHadith((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleFinish = async () => {
    await updatePreferences({
      showArabic,
      arabicFont,
      activeTranslationIds: selectedTranslations.length > 0 ? selectedTranslations : [1001],
      activeTafsirIds: selectedTafsirs.length > 0 ? selectedTafsirs : [74],
      activeHadithCollections: selectedHadith.length > 0 ? selectedHadith : ["bukhari"],
      onboardingComplete: true,
    });
    router.push("/surah/1");
  };

  return (
    <div className="w-full max-w-lg px-6">
      {/* Progress bar */}
      <div className="mb-8 flex items-center gap-1">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[360px]">
        {step === 0 && <StepWelcome />}
        {step === 1 && (
          <StepArabic
            showArabic={showArabic}
            setShowArabic={setShowArabic}
            arabicFont={arabicFont}
            setArabicFont={setArabicFont}
          />
        )}
        {step === 2 && (
          <StepTranslations
            selected={selectedTranslations}
            onToggle={toggleTranslation}
          />
        )}
        {step === 3 && (
          <StepStudyTools
            selectedTafsirs={selectedTafsirs}
            onToggleTafsir={toggleTafsir}
            selectedHadith={selectedHadith}
            onToggleHadith={toggleHadith}
          />
        )}
        {step === 4 && <StepDone />}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={cn(
            "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-fast",
            step === 0
              ? "invisible"
              : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-fast hover:bg-primary/90"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex items-center gap-1 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-fast hover:bg-primary/90"
          >
            Begin Reading
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function StepWelcome() {
  return (
    <div className="text-center">
      <BookOpenText className="mx-auto h-12 w-12 text-primary" />
      <h1 className="mt-6 text-3xl font-bold text-foreground">Bismillah</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Let&apos;s set up your reading experience.
      </p>
      <p className="mt-6 text-sm text-muted-foreground/70">
        You can always change these settings later.
      </p>
    </div>
  );
}

function StepArabic({
  showArabic,
  setShowArabic,
  arabicFont,
  setArabicFont,
}: {
  showArabic: boolean;
  setShowArabic: (v: boolean) => void;
  arabicFont: "uthmani" | "simple";
  setArabicFont: (v: "uthmani" | "simple") => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground">Arabic Text</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Show Arabic text alongside translations?
      </p>

      <div className="mt-6 space-y-3">
        <ToggleOption
          label="Show Arabic text"
          active={showArabic}
          onClick={() => setShowArabic(true)}
        />
        <ToggleOption
          label="Translation only"
          active={!showArabic}
          onClick={() => setShowArabic(false)}
        />
      </div>

      {showArabic && (
        <div className="mt-6">
          <p className="text-sm font-medium text-foreground mb-3">Arabic script style</p>
          <div className="space-y-3">
            <ToggleOption
              label="Uthmani Script"
              description="Traditional calligraphic style"
              active={arabicFont === "uthmani"}
              onClick={() => setArabicFont("uthmani")}
            />
            <ToggleOption
              label="Simple Script"
              description="Modern simplified Arabic"
              active={arabicFont === "simple"}
              onClick={() => setArabicFont("simple")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StepTranslations({
  selected,
  onToggle,
}: {
  selected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground">Translations</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Select 1-3 translations to display alongside the Arabic text.
      </p>

      <div className="mt-6 space-y-2">
        {TRANSLATIONS.map((t) => (
          <button
            key={t.id}
            onClick={() => onToggle(t.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-fast",
              selected.includes(t.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30 hover:bg-surface-hover",
            )}
          >
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-fast",
                selected.includes(t.id)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30",
              )}
            >
              {selected.includes(t.id) && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.author}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepStudyTools({
  selectedTafsirs,
  onToggleTafsir,
  selectedHadith,
  onToggleHadith,
}: {
  selectedTafsirs: number[];
  onToggleTafsir: (id: number) => void;
  selectedHadith: string[];
  onToggleHadith: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground">Study Tools</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose which tafsirs and hadith collections to use.
      </p>

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground mb-2">Tafsir (Commentary)</p>
        <div className="space-y-2">
          {TAFSIRS.map((t) => (
            <CheckOption
              key={t.id}
              label={t.name}
              description={t.author}
              checked={selectedTafsirs.includes(t.id)}
              onToggle={() => onToggleTafsir(t.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground mb-2">Hadith Collections</p>
        <div className="space-y-2">
          {HADITH_COLLECTIONS.map((h) => (
            <CheckOption
              key={h.id}
              label={h.name}
              checked={selectedHadith.includes(h.id)}
              onToggle={() => onToggleHadith(h.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepDone() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <BookOpenText className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-foreground">You&apos;re all set!</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your reading experience is configured. Click &quot;Begin Reading&quot; to start with Surah Al-Fatihah.
      </p>
      <p className="mt-4 text-xs text-muted-foreground/70">
        You can change any of these settings later from the Settings page.
      </p>
    </div>
  );
}

function ToggleOption({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-fast",
        active
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/30 hover:bg-surface-hover",
      )}
    >
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-fast",
          active ? "border-primary" : "border-muted-foreground/30",
        )}
      >
        {active && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </button>
  );
}

function CheckOption({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-fast",
        checked
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/30 hover:bg-surface-hover",
      )}
    >
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-fast",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30",
        )}
      >
        {checked && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </button>
  );
}
