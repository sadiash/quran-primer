"use client";

import { useState, useCallback } from "react";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import { PageHeader } from "@/presentation/components/layout/page-header";
import { cn } from "@/lib/utils";
import type {
  ArabicFont,
  ArabicFontSize,
  TranslationFontSize,
  TranslationFontFamily,
  TranslationColorSlot,
  TranslationConfig,
  TranslationLayout,
  PaperTexture,
} from "@/core/types";
import { getResolvedTranslationConfigs } from "@/core/types";
import { CaretDownIcon, CaretUpIcon, CheckIcon, DownloadSimpleIcon, PlusIcon, TrashIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
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
    if (resolvedConfigs.length <= 1) return; // keep at least one
    const next = resolvedConfigs.filter((c) => c.translationId !== id);
    // Re-normalize order
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

  const updateTranslationConfig = (id: number, patch: Partial<Pick<TranslationConfig, "fontSize" | "colorSlot" | "fontFamily" | "bold">>) => {
    const next = resolvedConfigs.map((c) =>
      c.translationId === id ? { ...c, ...patch } : c,
    );
    updateConfigs(next);
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
    <div className="mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Settings"
        subtitle="Customize your reading and study experience."
      />

      <div className="mt-8 space-y-10">
        {/* ── Appearance ── */}
        <Section title="Appearance">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              Paper texture
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Choose a background texture feel. &ldquo;Auto&rdquo; uses the theme default.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PAPER_TEXTURES.map((pt) => (
                <PaperTextureCard
                  key={pt.value}
                  texture={pt}
                  isActive={(preferences.paperTexture ?? "auto") === pt.value}
                  onSelect={() => updatePreferences({ paperTexture: pt.value })}
                />
              ))}
            </div>
          </div>
        </Section>

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
          <SettingRow label="Arabic script style" disabled={!preferences.showArabic}>
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

          {/* Concept tags */}
          <SettingRow label="Show concept tags">
            <ToggleSwitch
              checked={preferences.showConcepts}
              onChange={(v) => updatePreferences({ showConcepts: v })}
            />
          </SettingRow>

          {/* Concept tag sub-settings */}
          <SettingRow label="Max visible per verse" disabled={!preferences.showConcepts}>
            <SegmentedControl
              value={String(preferences.conceptMaxVisible)}
              options={[
                { value: "3", label: "3" },
                { value: "5", label: "5" },
                { value: "10", label: "10" },
                { value: "0", label: "All" },
              ]}
              onChange={(v) => updatePreferences({ conceptMaxVisible: Number(v) })}
            />
          </SettingRow>

          <SettingRow label="Pill color" disabled={!preferences.showConcepts}>
            <div className="flex gap-1.5">
              {/* Slot 0: muted default */}
              <button
                onClick={() => updatePreferences({ conceptColorSlot: 0 })}
                className={cn(
                  "h-5 w-5 rounded-full bg-muted transition-all",
                  preferences.conceptColorSlot === 0
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:scale-105",
                )}
                aria-label="Default muted color"
              />
              {/* Slots 1-6: translation color palette */}
              {([1, 2, 3, 4, 5, 6] as const).map((slot) => (
                <button
                  key={slot}
                  onClick={() => updatePreferences({ conceptColorSlot: slot })}
                  className={cn(
                    "h-5 w-5 rounded-full transition-all",
                    preferences.conceptColorSlot === slot
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "hover:scale-105",
                  )}
                  style={{ backgroundColor: `hsl(var(--translation-${slot}))` }}
                  aria-label={`Color ${slot}`}
                />
              ))}
            </div>
          </SettingRow>

          {/* Translation layout */}
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

          {/* Active translations — reorderable with per-translation controls */}
          <div className="pt-2">
            <p className="text-sm font-medium text-foreground mb-3">
              Active translations
            </p>
            <div className="space-y-2">
              {resolvedConfigs.map((config, idx) => {
                const info = TRANSLATIONS.find((t) => t.id === config.translationId);
                if (!info) return null;
                return (
                  <TranslationConfigRow
                    key={config.translationId}
                    name={info.name}
                    author={info.author}
                    config={config}
                    isPrimary={idx === 0}
                    isFirst={idx === 0}
                    isLast={idx === resolvedConfigs.length - 1}
                    canRemove={resolvedConfigs.length > 1}
                    onMoveUp={() => moveTranslation(config.translationId, "up")}
                    onMoveDown={() => moveTranslation(config.translationId, "down")}
                    onRemove={() => deactivateTranslation(config.translationId)}
                    onChangeFontSize={(fs) => updateTranslationConfig(config.translationId, { fontSize: fs })}
                    onChangeFontFamily={(ff) => updateTranslationConfig(config.translationId, { fontFamily: ff })}
                    onToggleBold={() => updateTranslationConfig(config.translationId, { bold: !config.bold })}
                    onChangeColor={(cs) => updateTranslationConfig(config.translationId, { colorSlot: cs })}
                  />
                );
              })}
            </div>
          </div>

          {/* Inactive translations — add buttons */}
          {(() => {
            const activeIds = new Set(resolvedConfigs.map((c) => c.translationId));
            const inactive = TRANSLATIONS.filter((t) => !activeIds.has(t.id));
            if (inactive.length === 0) return null;
            return (
              <div className="pt-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Available translations
                </p>
                <div className="space-y-1">
                  {inactive.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => activateTranslation(t.id)}
                      className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-left text-sm text-muted-foreground hover:border-muted-foreground/30 hover:bg-surface-hover transition-fast"
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

        {/* ── Data ── */}
        <DataSection />

      </div>
    </div>
  );
}

/* ─── Data management ─── */

const LS_KEYS = ["panels:open", "notes:sort", "hadith:recent-searches", "command-palette:recent"];

function DataSection() {
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ path: string; filename: string } | null>(null);
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

      // Write file to Desktop via API
      const res = await fetch("/api/v1/export", {
        method: "POST",
        body: new URLSearchParams({ payload: JSON.stringify(payload) }),
      });
      const result = await res.json();
      if (result.ok) {
        setExportResult(result);
      }
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
        {/* Export */}
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            Export all data
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Save your notes, bookmarks, reading progress, and settings as a JSON file to your Desktop.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-fast disabled:opacity-50"
          >
            <DownloadSimpleIcon weight="bold" className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export to Desktop"}
          </button>
          {exportResult && (
            <p className="mt-2 text-xs text-green-500 font-medium">
              Saved to {exportResult.path}
            </p>
          )}
        </div>

        {/* Clear */}
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            Clear all data
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Permanently delete all your notes, bookmarks, reading progress, and settings.
            This cannot be undone.
          </p>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-fast"
            >
              <TrashIcon weight="bold" className="h-4 w-4" />
              Clear all data
            </button>
          ) : (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <WarningIcon weight="fill" className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Are you sure?
                  </p>
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
                  className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-fast disabled:opacity-50"
                >
                  <TrashIcon weight="bold" className="h-4 w-4" />
                  {clearing ? "Clearing..." : "Yes, delete everything"}
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-fast"
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
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", disabled && "opacity-40 pointer-events-none")}>
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

/* ─── Per-translation config row ─── */

const FONT_SIZES: { value: TranslationFontSize; label: string }[] = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
  { value: "xl", label: "XL" },
];

const COLOR_SLOTS: TranslationColorSlot[] = [1, 2, 3, 4, 5, 6];

function TranslationConfigRow({
  name,
  author,
  config,
  isPrimary,
  isFirst,
  isLast,
  canRemove,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChangeFontSize,
  onChangeFontFamily,
  onToggleBold,
  onChangeColor,
}: {
  name: string;
  author: string;
  config: TranslationConfig;
  isPrimary: boolean;
  isFirst: boolean;
  isLast: boolean;
  canRemove: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onChangeFontSize: (fs: TranslationFontSize) => void;
  onChangeFontFamily: (ff: TranslationFontFamily) => void;
  onToggleBold: () => void;
  onChangeColor: (cs: TranslationColorSlot) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2.5">
      {/* Header row: name, primary badge, reorder, remove */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground truncate">{name}</p>
            {isPrimary && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Primary
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{author}</p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="rounded p-1 text-muted-foreground hover:bg-surface-hover disabled:opacity-20 transition-fast"
            aria-label="Move up"
          >
            <CaretUpIcon weight="bold" className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="rounded p-1 text-muted-foreground hover:bg-surface-hover disabled:opacity-20 transition-fast"
            aria-label="Move down"
          >
            <CaretDownIcon weight="bold" className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRemove}
            disabled={!canRemove}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-20 transition-fast"
            aria-label="Remove"
          >
            <XIcon weight="bold" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Controls row: font size + color */}
      <div className="flex items-center gap-4">
        {/* Font size */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Size</span>
          <div className="flex rounded-md border border-border">
            {FONT_SIZES.map((fs, i) => (
              <button
                key={fs.value}
                onClick={() => onChangeFontSize(fs.value)}
                className={cn(
                  "px-2 py-1 text-[11px] font-medium transition-colors",
                  config.fontSize === fs.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  i === 0 && "rounded-l-md",
                  i === FONT_SIZES.length - 1 && "rounded-r-md",
                )}
              >
                {fs.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font family */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Font</span>
          <div className="flex rounded-md border border-border">
            {(["sans", "serif"] as const).map((ff, i) => (
              <button
                key={ff}
                onClick={() => onChangeFontFamily(ff)}
                className={cn(
                  "px-2 py-1 text-[11px] font-medium transition-colors",
                  (config.fontFamily ?? "sans") === ff
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  i === 0 && "rounded-l-md",
                  i === 1 && "rounded-r-md",
                )}
              >
                {ff === "sans" ? "Sans" : "Serif"}
              </button>
            ))}
          </div>
        </div>

        {/* Bold */}
        <button
          onClick={onToggleBold}
          className={cn(
            "flex items-center justify-center h-7 w-7 rounded-md border text-[11px] font-bold transition-colors",
            config.bold
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
          aria-label="Toggle bold"
        >
          B
        </button>

        {/* Color */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Color</span>
          <div className="flex gap-1.5">
            {COLOR_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => onChangeColor(slot)}
                className={cn(
                  "h-5 w-5 rounded-full transition-all",
                  config.colorSlot === slot
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "hover:scale-105",
                )}
                style={{ backgroundColor: `hsl(var(--translation-${slot}))` }}
                aria-label={`Color ${slot}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Paper texture data & card ─── */

interface PaperTextureOption {
  value: PaperTexture;
  label: string;
  description: string;
  preview: React.CSSProperties;
}

const PAPER_TEXTURES: PaperTextureOption[] = [
  {
    value: "auto",
    label: "Auto",
    description: "Theme default",
    preview: {
      background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.03))",
    },
  },
  {
    value: "none",
    label: "Clean",
    description: "No texture",
    preview: {
      background: "hsl(var(--background))",
      border: "1px dashed hsl(var(--border))",
    },
  },
  {
    value: "parchment",
    label: "Parchment",
    description: "Aged warm paper",
    preview: {
      background: "radial-gradient(ellipse at 30% 30%, hsl(35 55% 70% / 0.35), hsl(30 45% 65% / 0.15), hsl(40 40% 85% / 0.1))",
    },
  },
  {
    value: "silk",
    label: "Silk",
    description: "Smooth sheen",
    preview: {
      background: "linear-gradient(135deg, hsl(210 30% 92% / 0.3), hsl(280 20% 90% / 0.2), hsl(210 20% 95% / 0.15))",
    },
  },
  {
    value: "canvas",
    label: "Canvas",
    description: "Rough texture",
    preview: {
      background: "radial-gradient(ellipse at 50% 50%, hsl(45 25% 78% / 0.25), hsl(30 20% 72% / 0.15))",
    },
  },
  {
    value: "watercolor",
    label: "Watercolor",
    description: "Painted washes",
    preview: {
      background: "radial-gradient(ellipse at 20% 30%, hsl(200 60% 75% / 0.25), transparent 50%), radial-gradient(ellipse at 80% 60%, hsl(340 50% 75% / 0.15), transparent 40%), radial-gradient(ellipse at 50% 80%, hsl(45 65% 70% / 0.2), transparent 50%)",
    },
  },
];

function PaperTextureCard({
  texture,
  isActive,
  onSelect,
}: {
  texture: PaperTextureOption;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition-fast",
        "hover:bg-surface-hover",
        isActive && "ring-2 ring-primary/40 bg-surface-active",
      )}
    >
      <div
        className="h-10 w-full rounded-md border border-border/50"
        style={texture.preview}
      />
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-medium text-foreground">{texture.label}</span>
        {isActive && <CheckIcon weight="fill" className="h-3 w-3 text-primary" />}
      </div>
      <span className="text-[9px] text-muted-foreground leading-tight">{texture.description}</span>
    </button>
  );
}
