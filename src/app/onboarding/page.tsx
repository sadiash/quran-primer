"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CaretLeftIcon, CaretRightIcon, CheckIcon } from "@phosphor-icons/react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { LogoIcon } from "@/presentation/components/layout/logo";
import { cn } from "@/lib/utils";
import type { ThemeName } from "@/core/types";

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
];

interface ThemeOption {
  name: ThemeName;
  label: string;
  description: string;
  mode: "light" | "dark";
  swatches: [string, string, string];
}

const THEMES: ThemeOption[] = [
  { name: "library", label: "The Library", description: "Warm ivory, gold accents", mode: "light", swatches: ["hsl(40 33% 96%)", "hsl(36 72% 44%)", "hsl(168 28% 38%)"] },
  { name: "sahara", label: "Sahara", description: "Warm sand, terracotta", mode: "light", swatches: ["hsl(35 40% 95%)", "hsl(25 80% 50%)", "hsl(168 40% 42%)"] },
  { name: "amethyst", label: "Amethyst", description: "Frosted periwinkle, purple", mode: "light", swatches: ["hsl(210 40% 98%)", "hsl(265 90% 55%)", "hsl(200 85% 60%)"] },
  { name: "garden", label: "Garden", description: "Soft mint, pastel green", mode: "light", swatches: ["hsl(140 30% 97%)", "hsl(145 45% 55%)", "hsl(280 35% 70%)"] },
  { name: "observatory", label: "The Observatory", description: "Deep navy, amber glow", mode: "dark", swatches: ["hsl(225 35% 7%)", "hsl(42 88% 56%)", "hsl(185 55% 48%)"] },
  { name: "cosmos", label: "Cosmos", description: "Cosmic blue, cyan glow", mode: "dark", swatches: ["hsl(220 25% 8%)", "hsl(200 95% 65%)", "hsl(270 85% 70%)"] },
  { name: "midnight", label: "Midnight", description: "True black OLED, ice cyan", mode: "dark", swatches: ["hsl(0 0% 4%)", "hsl(200 95% 65%)", "hsl(160 90% 50%)"] },
  { name: "matrix", label: "Matrix", description: "Terminal green, phosphor", mode: "dark", swatches: ["hsl(120 15% 6%)", "hsl(120 100% 50%)", "hsl(120 80% 35%)"] },
];

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const { preferences, updatePreferences } = usePreferences();
  const [step, setStep] = useState(0);

  // Selection state
  const [themeName, setThemeName] = useState<ThemeName>(preferences.themeName ?? "library");
  const [showArabic, setShowArabic] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
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

  // Apply theme live as user picks it
  const selectTheme = async (name: ThemeName) => {
    setThemeName(name);
    await updatePreferences({ themeName: name });
  };

  const handleFinish = async () => {
    await updatePreferences({
      themeName,
      showArabic,
      showTranslation,
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
          <StepTheme
            selected={themeName}
            onSelect={selectTheme}
          />
        )}
        {step === 2 && (
          <StepArabic
            showArabic={showArabic}
            setShowArabic={setShowArabic}
            showTranslation={showTranslation}
            setShowTranslation={setShowTranslation}
            arabicFont={arabicFont}
            setArabicFont={setArabicFont}
          />
        )}
        {step === 3 && (
          <StepTranslations
            selected={selectedTranslations}
            onToggle={toggleTranslation}
          />
        )}
        {step === 4 && (
          <StepStudyTools
            selectedTafsirs={selectedTafsirs}
            onToggleTafsir={toggleTafsir}
            selectedHadith={selectedHadith}
            onToggleHadith={toggleHadith}
          />
        )}
        {step === 5 && <StepDone />}
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
          <CaretLeftIcon weight="bold" className="h-4 w-4" />
          Back
        </button>

        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-fast hover:bg-primary/90"
          >
            Next
            <CaretRightIcon weight="bold" className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex items-center gap-1 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-fast hover:bg-primary/90"
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
      <LogoIcon className="mx-auto h-12 w-12 text-primary" />
      <h1 className="mt-6 text-3xl font-bold text-foreground">Bismillah</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Welcome to The Primer.
      </p>
      <p className="mt-2 text-sm text-muted-foreground/70">
        Let&apos;s set up your reading experience in a few quick steps.
      </p>
      <p className="mt-6 text-xs text-muted-foreground/50">
        You can always change these settings later.
      </p>
    </div>
  );
}

function StepTheme({
  selected,
  onSelect,
}: {
  selected: ThemeName;
  onSelect: (name: ThemeName) => void;
}) {
  const lightThemes = THEMES.filter((t) => t.mode === "light");
  const darkThemes = THEMES.filter((t) => t.mode === "dark");

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground">Choose a Theme</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pick a look that feels right. The theme applies instantly.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Light</p>
          <div className="grid grid-cols-2 gap-2">
            {lightThemes.map((t) => (
              <ThemeCard key={t.name} theme={t} isActive={selected === t.name} onSelect={() => onSelect(t.name)} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Dark</p>
          <div className="grid grid-cols-2 gap-2">
            {darkThemes.map((t) => (
              <ThemeCard key={t.name} theme={t} isActive={selected === t.name} onSelect={() => onSelect(t.name)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeOption;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-fast",
        "hover:bg-surface-hover",
        isActive && "bg-surface-active ring-1 ring-primary/30",
      )}
    >
      <div className="flex shrink-0 gap-0.5">
        {theme.swatches.map((color, i) => (
          <div
            key={i}
            className={cn("rounded-full border border-border/50", i === 0 ? "h-5 w-5" : "h-4 w-4")}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-foreground">{theme.label}</div>
        <div className="truncate text-[10px] text-muted-foreground">{theme.description}</div>
      </div>
      {isActive && <CheckIcon weight="fill" className="h-3.5 w-3.5 shrink-0 text-primary" />}
    </button>
  );
}

function StepArabic({
  showArabic,
  setShowArabic,
  showTranslation,
  setShowTranslation,
  arabicFont,
  setArabicFont,
}: {
  showArabic: boolean;
  setShowArabic: (v: boolean) => void;
  showTranslation: boolean;
  setShowTranslation: (v: boolean) => void;
  arabicFont: "uthmani" | "simple";
  setArabicFont: (v: "uthmani" | "simple") => void;
}) {
  const mode = showArabic && showTranslation ? "both" : showArabic ? "arabic" : "translation";

  const setMode = (m: "arabic" | "translation" | "both") => {
    setShowArabic(m === "arabic" || m === "both");
    setShowTranslation(m === "translation" || m === "both");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground">Reading Mode</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        What would you like to see while reading?
      </p>

      <div className="mt-6 space-y-3">
        <ToggleOption label="Arabic &amp; Translation" description="See both side by side" active={mode === "both"} onClick={() => setMode("both")} />
        <ToggleOption label="Arabic only" description="Focus on the original text" active={mode === "arabic"} onClick={() => setMode("arabic")} />
        <ToggleOption label="Translation only" description="Read in your language" active={mode === "translation"} onClick={() => setMode("translation")} />
      </div>

      {showArabic && (
        <div className="mt-6">
          <p className="text-sm font-medium text-foreground mb-3">Arabic script style</p>
          <div className="space-y-3">
            <ToggleOption label="Uthmani Script" description="Traditional calligraphic style" active={arabicFont === "uthmani"} onClick={() => setArabicFont("uthmani")} />
            <ToggleOption label="Simple Script" description="Modern simplified Arabic" active={arabicFont === "simple"} onClick={() => setArabicFont("simple")} />
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
        Select one or more translations to display.
      </p>

      <div className="mt-6 space-y-2">
        {TRANSLATIONS.map((t) => (
          <CheckOption
            key={t.id}
            label={t.name}
            description={t.author}
            checked={selected.includes(t.id)}
            onToggle={() => onToggle(t.id)}
          />
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
            <CheckOption key={t.id} label={t.name} description={t.author} checked={selectedTafsirs.includes(t.id)} onToggle={() => onToggleTafsir(t.id)} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground mb-2">Hadith Collections</p>
        <div className="space-y-2">
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
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <LogoIcon className="h-8 w-8 text-primary" />
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

/* ─── Shared components ─── */

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
