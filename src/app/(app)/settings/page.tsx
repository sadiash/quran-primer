"use client";

import { usePreferences } from "@/presentation/hooks/use-preferences";
import { ThemeSwitcher } from "@/presentation/components/ui/theme-switcher";
import { cn } from "@/lib/utils";
import type {
  ArabicFont,
  ArabicFontSize,
  TranslationFontSize,
  TranslationLayout,
} from "@/core/types";

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

export default function SettingsPage() {
  const { preferences, updatePreferences } = usePreferences();

  const toggleTranslation = (id: number) => {
    const current = preferences.activeTranslationIds;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    if (next.length > 0) updatePreferences({ activeTranslationIds: next });
  };

  const toggleTafsir = (id: number) => {
    const current = preferences.activeTafsirIds;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    if (next.length > 0) updatePreferences({ activeTafsirIds: next });
  };

  const toggleHadith = (id: string) => {
    const current = preferences.activeHadithCollections;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    if (next.length > 0) updatePreferences({ activeHadithCollections: next });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Customize your reading and study experience.
      </p>

      <div className="mt-8 space-y-10">
        {/* ── Reading ── */}
        <Section title="Reading">
          {/* Arabic toggle */}
          <SettingRow label="Show Arabic text">
            <ToggleSwitch
              checked={preferences.showArabic}
              onChange={(v) => updatePreferences({ showArabic: v })}
            />
          </SettingRow>

          {/* Arabic font */}
          <SettingRow label="Arabic script style">
            <SegmentedControl
              value={preferences.arabicFont}
              options={[
                { value: "uthmani" as ArabicFont, label: "Uthmani" },
                { value: "simple" as ArabicFont, label: "Simple" },
              ]}
              onChange={(v) => updatePreferences({ arabicFont: v })}
            />
          </SettingRow>

          {/* Arabic font size */}
          <SettingRow label="Arabic font size">
            <SegmentedControl
              value={preferences.arabicFontSize}
              options={[
                { value: "sm" as ArabicFontSize, label: "S" },
                { value: "md" as ArabicFontSize, label: "M" },
                { value: "lg" as ArabicFontSize, label: "L" },
                { value: "xl" as ArabicFontSize, label: "XL" },
                { value: "2xl" as ArabicFontSize, label: "2XL" },
              ]}
              onChange={(v) => updatePreferences({ arabicFontSize: v })}
            />
          </SettingRow>

          {/* Translation font size */}
          <SettingRow label="Translation font size">
            <SegmentedControl
              value={preferences.translationFontSize}
              options={[
                { value: "sm" as TranslationFontSize, label: "S" },
                { value: "md" as TranslationFontSize, label: "M" },
                { value: "lg" as TranslationFontSize, label: "L" },
              ]}
              onChange={(v) => updatePreferences({ translationFontSize: v })}
            />
          </SettingRow>

          {/* Translation layout */}
          <SettingRow label="Translation layout">
            <SegmentedControl
              value={preferences.translationLayout}
              options={[
                { value: "stacked" as TranslationLayout, label: "Stacked" },
                { value: "columnar" as TranslationLayout, label: "Columns" },
                { value: "tabbed" as TranslationLayout, label: "Tabbed" },
              ]}
              onChange={(v) => updatePreferences({ translationLayout: v })}
            />
          </SettingRow>

          {/* Translations */}
          <div className="pt-2">
            <p className="text-sm font-medium text-foreground mb-3">
              Active translations
            </p>
            <div className="space-y-1.5">
              {TRANSLATIONS.map((t) => (
                <CheckRow
                  key={t.id}
                  label={t.name}
                  description={t.author}
                  checked={preferences.activeTranslationIds.includes(t.id)}
                  onToggle={() => toggleTranslation(t.id)}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* ── Study ── */}
        <Section title="Study">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              Tafsir (Commentary)
            </p>
            <div className="space-y-1.5">
              {TAFSIRS.map((t) => (
                <CheckRow
                  key={t.id}
                  label={t.name}
                  description={t.author}
                  checked={preferences.activeTafsirIds.includes(t.id)}
                  onToggle={() => toggleTafsir(t.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              Hadith collections
            </p>
            <div className="space-y-1.5">
              {HADITH_COLLECTIONS.map((h) => (
                <CheckRow
                  key={h.id}
                  label={h.name}
                  checked={preferences.activeHadithCollections.includes(h.id)}
                  onToggle={() => toggleHadith(h.id)}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* ── Appearance ── */}
        <Section title="Appearance">
          <ThemeSwitcher />
        </Section>
      </div>
    </div>
  );
}

/* ─── Shared sub-components ─── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-foreground">{label}</span>
      {children}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border">
      {options.map((opt, i) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium transition-colors",
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
            i === 0 && "rounded-l-lg",
            i === options.length - 1 && "rounded-r-lg",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CheckRow({
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
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-fast",
        checked
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-muted-foreground/30 hover:bg-surface-hover",
      )}
    >
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-fast",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30",
        )}
      >
        {checked && (
          <svg
            className="h-2.5 w-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </button>
  );
}
