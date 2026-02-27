"use client";

import { useState, useCallback } from "react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { cn } from "@/lib/utils";
import type {
  ArabicFontSize,
  TranslationConfig,
  TranslationFontSize,
  TranslationLayout,
  TranslationColorSlot,
} from "@/core/types";
import { getResolvedTranslationConfigs } from "@/core/types";
import { CaretDownIcon, CaretUpIcon, DownloadSimpleIcon, PlusIcon, TrashIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { db } from "@/infrastructure/db/client/schema";

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

export default function SettingsPage() {
  const { preferences, updatePreferences } = usePreferences();

  const resolvedConfigs = getResolvedTranslationConfigs(
    preferences.activeTranslationIds,
    preferences.translationConfigs,
    preferences.translationFontSize,
  );

  const updateConfigs = (newConfigs: TranslationConfig[]) => {
    const newActiveIds = newConfigs.map((c) => c.translationId);
    updatePreferences({
      activeTranslationIds: newActiveIds,
      translationConfigs: newConfigs,
    });
  };

  const deactivateTranslation = (id: number) => {
    if (resolvedConfigs.length <= 1) return;
    const next = resolvedConfigs.filter((c) => c.translationId !== id);
    const renumbered = next.map((c, i) => ({ ...c, order: i }));
    updateConfigs(renumbered);
  };

  const activateTranslation = (id: number) => {
    const alreadyActive = resolvedConfigs.some((c) => c.translationId === id);
    if (alreadyActive) return;
    const newConfig: TranslationConfig = {
      translationId: id,
      order: resolvedConfigs.length,
      fontSize: preferences.translationFontSize,
      colorSlot: (((resolvedConfigs.length) % 6) + 1) as TranslationColorSlot,
      fontFamily: "sans",
    };
    updateConfigs([...resolvedConfigs, newConfig]);
  };

  const moveTranslation = (id: number, direction: "up" | "down") => {
    const idx = resolvedConfigs.findIndex((c) => c.translationId === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= resolvedConfigs.length) return;
    const next = [...resolvedConfigs];
    [next[idx], next[swapIdx]] = [next[swapIdx]!, next[idx]!];
    const renumbered = next.map((c, i) => ({ ...c, order: i }));
    updateConfigs(renumbered);
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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Settings"
        subtitle="Configure your reading and study tools."
      />

      <div className="mt-8 space-y-10">
        {/* ── Reading ── */}
        <Section title="Reading">
          <SettingRow label="Track reading progress" subtitle="Mark surahs as you read them">
            <ToggleSwitch
              checked={preferences.trackProgress}
              onChange={(v) => updatePreferences({ trackProgress: v })}
            />
          </SettingRow>

          <SettingRow label="Show Arabic text">
            <ToggleSwitch
              checked={preferences.showArabic}
              onChange={(v) => updatePreferences({ showArabic: v })}
            />
          </SettingRow>

          <SettingRow label="Arabic font size" disabled={!preferences.showArabic}>
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

          <SettingRow label="Show translation">
            <ToggleSwitch
              checked={preferences.showTranslation}
              onChange={(v) => updatePreferences({ showTranslation: v })}
            />
          </SettingRow>

          <SettingRow label="Translation font size" disabled={!preferences.showTranslation}>
            <SegmentedControl
              value={preferences.translationFontSize}
              options={[
                { value: "sm" as TranslationFontSize, label: "S" },
                { value: "md" as TranslationFontSize, label: "M" },
                { value: "lg" as TranslationFontSize, label: "L" },
                { value: "xl" as TranslationFontSize, label: "XL" },
              ]}
              onChange={(v) => {
                // Update global + all per-translation configs
                const updatedConfigs = resolvedConfigs.map((c) => ({ ...c, fontSize: v }));
                updatePreferences({
                  translationFontSize: v,
                  translationConfigs: updatedConfigs,
                });
              }}
            />
          </SettingRow>

          <SettingRow label="Translation layout">
            <SegmentedControl
              value={preferences.translationLayout}
              options={[
                { value: "stacked" as TranslationLayout, label: "Stacked" },
                { value: "columnar" as TranslationLayout, label: "Side by side" },
              ]}
              onChange={(v) => updatePreferences({ translationLayout: v })}
            />
          </SettingRow>

          <SettingRow label="Show concept tags">
            <ToggleSwitch
              checked={preferences.showConcepts}
              onChange={(v) => updatePreferences({ showConcepts: v })}
            />
          </SettingRow>
        </Section>

        {/* ── Translations ── */}
        <Section title="Translations">
          <div className="space-y-2">
            {resolvedConfigs.map((config, idx) => {
              const info = TRANSLATIONS.find((t) => t.id === config.translationId);
              if (!info) return null;
              return (
                <div
                  key={config.translationId}
                  className="flex items-center gap-3 border border-border p-3"
                  style={{ borderLeft: `3px solid var(--translation-${config.colorSlot}-border)` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{info.name}</p>
                      {idx === 0 && (
                        <span
                          className="shrink-0 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: 'var(--highlight)', color: 'var(--surah-yellow-label)' }}
                        >
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{info.author}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => moveTranslation(config.translationId, "up")}
                      disabled={idx === 0}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                      aria-label="Move up"
                    >
                      <CaretUpIcon weight="bold" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveTranslation(config.translationId, "down")}
                      disabled={idx === resolvedConfigs.length - 1}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                      aria-label="Move down"
                    >
                      <CaretDownIcon weight="bold" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deactivateTranslation(config.translationId)}
                      disabled={resolvedConfigs.length <= 1}
                      className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-20 transition-colors"
                      aria-label="Remove"
                    >
                      <XIcon weight="bold" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Available translations */}
          {(() => {
            const activeIds = new Set(resolvedConfigs.map((c) => c.translationId));
            const inactive = TRANSLATIONS.filter((t) => !activeIds.has(t.id));
            if (inactive.length === 0) return null;
            return (
              <div className="pt-2">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Available
                </p>
                <div className="space-y-1">
                  {inactive.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => activateTranslation(t.id)}
                      className="flex w-full items-center gap-2 border border-dashed border-border px-3 py-2 text-left text-sm text-muted-foreground hover:bg-highlight transition-colors"
                    >
                      <PlusIcon weight="bold" className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.name}</span>
                      <span className="text-xs text-muted-foreground/60 ml-auto">{t.author}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
        </Section>

        {/* ── Study ── */}
        <Section title="Study Tools">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground mb-3">
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
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground mb-3">
              Hadith Collections
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

        {/* ── Data ── */}
        <DataSection />
      </div>
    </div>
  );
}

/* ─── Data management ─── */

const LS_KEYS = ["panels:open", "notes:sort", "hadith:recent-searches"];

function DataSection() {
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ ok: boolean } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportResult(null);
    try {
      const [bookmarks, notes, progress, preferences, graphNodes, graphEdges] =
        await Promise.all([
          db.bookmarks.toArray(),
          db.notes.toArray(),
          db.progress.toArray(),
          db.preferences.toArray(),
          db.graphNodes.toArray(),
          db.graphEdges.toArray(),
        ]);

      const localStorageData: Record<string, unknown> = {};
      for (const key of LS_KEYS) {
        try {
          const val = localStorage.getItem(key);
          if (val !== null) localStorageData[key] = JSON.parse(val);
        } catch { /* skip */ }
      }

      const payload = {
        exportedAt: new Date().toISOString(),
        version: 1,
        data: { bookmarks, notes, progress, preferences, graphNodes, graphEdges, localStorage: localStorageData },
      };

      const form = new FormData();
      form.append("payload", JSON.stringify(payload));
      const res = await fetch("/api/v1/export", { method: "POST", body: form });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "the-primer-backup.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportResult({ ok: true });
    } finally {
      setExporting(false);
    }
  }, []);

  const handleClear = useCallback(async () => {
    setClearing(true);
    try {
      await Promise.all([
        db.bookmarks.clear(),
        db.notes.clear(),
        db.progress.clear(),
        db.preferences.clear(),
        db.crossReferences.clear(),
        db.graphNodes.clear(),
        db.graphEdges.clear(),
      ]);
      for (const key of LS_KEYS) {
        try { localStorage.removeItem(key); } catch { /* skip */ }
      }
      setConfirmClear(false);
      window.location.reload();
    } finally {
      setClearing(false);
    }
  }, []);

  return (
    <Section title="Data">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Export all data</p>
          <p className="text-xs text-muted-foreground mb-3">
            Save your notes, bookmarks, reading progress, and settings as a JSON file.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-highlight transition-colors disabled:opacity-50"
          >
            <DownloadSimpleIcon weight="bold" className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export Data"}
          </button>
          {exportResult && (
            <p className="mt-2 text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--surah-teal-label)' }}>
              Download started
            </p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-1">Clear all data</p>
          <p className="text-xs text-muted-foreground mb-3">
            Permanently delete all your notes, bookmarks, reading progress, and settings.
            This cannot be undone.
          </p>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-2 border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <TrashIcon weight="bold" className="h-4 w-4" />
              Clear all data
            </button>
          ) : (
            <div className="border border-destructive/40 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <WarningIcon weight="fill" className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Are you sure?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This will permanently delete all your notes, bookmarks, reading progress,
                    knowledge graph, and settings. Consider exporting a backup first.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  disabled={clearing}
                  className="inline-flex items-center gap-2 bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  <TrashIcon weight="bold" className="h-4 w-4" />
                  {clearing ? "Clearing..." : "Yes, delete everything"}
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ─── Shared sub-components ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground border-b border-border pb-2 mb-4">
        [ {title} ]
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SettingRow({ label, subtitle, children, disabled }: {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", disabled && "opacity-40 pointer-events-none")}>
      <div>
        <span className="text-sm text-foreground">{label}</span>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center transition-colors",
        checked ? "bg-foreground" : "bg-border",
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 bg-background shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

function SegmentedControl<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex border border-border">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors",
            value === opt.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CheckRow({ label, description, checked, onToggle }: {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors",
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
