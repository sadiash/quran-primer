"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CaretLeftIcon, CaretRightIcon, CheckIcon } from "@phosphor-icons/react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { LogoIcon } from "@/presentation/components/layout/logo";
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
  { id: 817, name: "Tazkirul Quran", author: "Maulana Wahiduddin Khan" },
];

const HADITH_COLLECTIONS = [
  { id: "bukhari", name: "Sahih al-Bukhari" },
  { id: "muslim", name: "Sahih Muslim" },
  { id: "abudawud", name: "Sunan Abu Dawud" },
  { id: "tirmidhi", name: "Jami' at-Tirmidhi" },
  { id: "nasai", name: "Sunan an-Nasa'i" },
  { id: "ibnmajah", name: "Sunan Ibn Majah" },
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { updatePreferences } = usePreferences();
  const [step, setStep] = useState(0);

  const [showArabic, setShowArabic] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
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
      showTranslation,
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
            className="h-0.5 flex-1 transition-all duration-300"
            style={{ backgroundColor: i <= step ? '#e8e337' : 'hsl(var(--border))' }}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[360px]">
        {step === 0 && <StepWelcome />}
        {step === 1 && (
          <StepReading
            showArabic={showArabic}
            setShowArabic={setShowArabic}
            showTranslation={showTranslation}
            setShowTranslation={setShowTranslation}
            selectedTranslations={selectedTranslations}
            onToggleTranslation={toggleTranslation}
          />
        )}
        {step === 2 && (
          <StepStudyTools
            selectedTafsirs={selectedTafsirs}
            onToggleTafsir={toggleTafsir}
            selectedHadith={selectedHadith}
            onToggleHadith={toggleHadith}
          />
        )}
        {step === 3 && <StepDone />}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={cn(
            "flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors",
            step === 0
              ? "invisible"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <CaretLeftIcon weight="bold" className="h-4 w-4" />
          Back
        </button>

        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1 px-5 py-2 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:opacity-80"
            style={{ backgroundColor: '#e8e337' }}
          >
            Next
            <CaretRightIcon weight="bold" className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex items-center gap-1 px-5 py-2 text-sm font-bold uppercase tracking-wider text-[#0a0a0a] transition-colors hover:opacity-80"
            style={{ backgroundColor: '#e8e337' }}
          >
            Begin Reading
            <CaretRightIcon weight="bold" className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Steps ─── */

function StepWelcome() {
  return (
    <div className="text-center">
      <LogoIcon className="mx-auto h-12 w-12 text-foreground" />
      <h1 className="mt-6 text-3xl font-bold uppercase tracking-tight text-foreground">Bismillah</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Welcome to The Primer.
      </p>
      <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
        Let&apos;s set up your reading experience in a few quick steps.
      </p>
      <p className="mt-6 font-mono text-[10px] text-muted-foreground/40">
        You can always change these settings later.
      </p>
    </div>
  );
}

function StepReading({
  showArabic,
  setShowArabic,
  showTranslation,
  setShowTranslation,
  selectedTranslations,
  onToggleTranslation,
}: {
  showArabic: boolean;
  setShowArabic: (v: boolean) => void;
  showTranslation: boolean;
  setShowTranslation: (v: boolean) => void;
  selectedTranslations: number[];
  onToggleTranslation: (id: number) => void;
}) {
  const mode = showArabic && showTranslation ? "both" : showArabic ? "arabic" : "translation";

  const setMode = (m: "arabic" | "translation" | "both") => {
    setShowArabic(m === "arabic" || m === "both");
    setShowTranslation(m === "translation" || m === "both");
  };

  return (
    <div>
      <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">Reading & Translations</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        What would you like to see while reading?
      </p>

      <div className="mt-6 space-y-2">
        <ToggleOption label="Arabic & Translation" description="See both together" active={mode === "both"} onClick={() => setMode("both")} />
        <ToggleOption label="Arabic only" description="Focus on the original text" active={mode === "arabic"} onClick={() => setMode("arabic")} />
        <ToggleOption label="Translation only" description="Read in your language" active={mode === "translation"} onClick={() => setMode("translation")} />
      </div>

      <div className="mt-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground mb-2">
          Select translations
        </p>
        <div className="space-y-1.5">
          {TRANSLATIONS.map((t) => (
            <CheckOption
              key={t.id}
              label={t.name}
              description={t.author}
              checked={selectedTranslations.includes(t.id)}
              onToggle={() => onToggleTranslation(t.id)}
            />
          ))}
        </div>
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
      <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">Study Tools</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose which tafsirs and hadith collections to use.
      </p>

      <div className="mt-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground mb-2">
          Tafsir (Commentary)
        </p>
        <div className="space-y-1.5">
          {TAFSIRS.map((t) => (
            <CheckOption key={t.id} label={t.name} description={t.author} checked={selectedTafsirs.includes(t.id)} onToggle={() => onToggleTafsir(t.id)} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground mb-2">
          Hadith Collections
        </p>
        <div className="space-y-1.5">
          {HADITH_COLLECTIONS.map((h) => (
            <CheckOption key={h.id} label={h.name} checked={selectedHadith.includes(h.id)} onToggle={() => onToggleHadith(h.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StepDone() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center" style={{ backgroundColor: 'var(--highlight)' }}>
        <LogoIcon className="h-8 w-8 text-foreground" />
      </div>
      <h2 className="mt-6 text-xl font-bold uppercase tracking-tight text-foreground">You&apos;re all set!</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your reading experience is configured. Click &quot;Begin Reading&quot; to start with Surah Al-Fatihah.
      </p>
      <p className="mt-4 font-mono text-[10px] text-muted-foreground/50">
        You can change any of these settings later.
      </p>
    </div>
  );
}

/* ─── Shared components ─── */

function ToggleOption({ label, description, active, onClick }: {
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 border p-3 text-left transition-colors",
        active
          ? "border-border bg-highlight"
          : "border-border hover:bg-surface",
      )}
    >
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors",
          active ? "border-foreground" : "border-muted-foreground/30",
        )}
        style={{ borderRadius: '50%' }}
      >
        {active && <div className="h-2.5 w-2.5 bg-foreground" style={{ borderRadius: '50%' }} />}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </button>
  );
}

function CheckOption({ label, description, checked, onToggle }: {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 border p-3 text-left transition-colors",
        checked
          ? "border-border bg-highlight"
          : "border-border hover:bg-surface",
      )}
    >
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
          checked
            ? "border-foreground bg-foreground text-background"
            : "border-muted-foreground/30",
        )}
      >
        {checked && (
          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
