"use client";

import { useState, useMemo } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  BookText,
  Bookmark,
  StickyNote,
  Search,
  Palette,
  Layout,
  Brain,
  Home,
  Settings2,
} from "lucide-react";
import { useCommandPalette } from "@/presentation/hooks/use-command-palette";
import { useWorkspace, WORKSPACE_PRESETS } from "@/presentation/providers";
import { usePreferences } from "@/presentation/hooks/use-preferences";
import type { ThemeName, WorkspacePresetId } from "@/core/types";

const SURAH_NAMES = [
  "Al-Fatihah","Al-Baqarah","Ali 'Imran","An-Nisa","Al-Ma'idah","Al-An'am","Al-A'raf","Al-Anfal","At-Tawbah","Yunus",
  "Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Taha",
  "Al-Anbya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml","Al-Qasas","Al-'Ankabut","Ar-Rum",
  "Luqman","As-Sajdah","Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shuraa","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf",
  "Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah",
  "As-Saf","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij",
  "Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","'Abasa",
  "At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad",
  "Ash-Shams","Al-Layl","Ad-Duhaa","Ash-Sharh","At-Tin","Al-'Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-'Adiyat",
  "Al-Qari'ah","At-Takathur","Al-'Asr","Al-Humazah","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas",
];

const THEMES: { name: ThemeName; label: string }[] = [
  { name: "library", label: "Library" },
  { name: "observatory", label: "Observatory" },
  { name: "amethyst", label: "Amethyst" },
  { name: "cosmos", label: "Cosmos" },
  { name: "midnight", label: "Midnight" },
  { name: "sahara", label: "Sahara" },
  { name: "garden", label: "Garden" },
  { name: "matrix", label: "Matrix" },
];

export function CommandPalette() {
  const { open, setOpen, addRecentCommand } = useCommandPalette();
  const router = useRouter();
  const { applyPreset, addPanel, toggleStudyRegion } = useWorkspace();
  const { updatePreferences } = usePreferences();
  const [search, setSearch] = useState("");

  const filteredSurahs = useMemo(() => {
    if (!search) return SURAH_NAMES.slice(0, 10);
    const lower = search.toLowerCase();
    return SURAH_NAMES.filter(
      (name, i) =>
        name.toLowerCase().includes(lower) ||
        String(i + 1).includes(lower),
    ).slice(0, 10);
  }, [search]);

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  const runCommand = (id: string, fn: () => void) => {
    addRecentCommand(id);
    fn();
    close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Dialog */}
      <div className="relative mx-auto mt-[15vh] w-full max-w-lg px-4">
        <Command
          className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          shouldFilter={false}
        >
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search surahs, commands, settings..."
              className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[50vh] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Navigation */}
            <Command.Group heading="Navigation" className="px-1 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <CommandItem
                onSelect={() => runCommand("nav:home", () => router.push("/"))}
              >
                <Home className="h-4 w-4" />
                Go Home
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand("nav:surahs", () => router.push("/surahs"))}
              >
                <BookOpen className="h-4 w-4" />
                Browse Surahs
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand("nav:bookmarks", () => router.push("/bookmarks"))}
              >
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand("nav:notes", () => router.push("/notes"))}
              >
                <StickyNote className="h-4 w-4" />
                Notes
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand("nav:knowledge", () => router.push("/knowledge"))}
              >
                <Brain className="h-4 w-4" />
                Knowledge Map
              </CommandItem>
            </Command.Group>

            {/* Surahs */}
            {filteredSurahs.length > 0 && (
              <Command.Group heading="Surahs" className="px-1 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {filteredSurahs.map((name) => {
                  const surahNum = SURAH_NAMES.indexOf(name) + 1;
                  return (
                    <CommandItem
                      key={surahNum}
                      onSelect={() => runCommand(`surah:${surahNum}`, () => router.push(`/surahs/${surahNum}`))}
                    >
                      <BookText className="h-4 w-4" />
                      <span className="font-mono text-muted-foreground text-xs w-6">{surahNum}.</span>
                      {name}
                    </CommandItem>
                  );
                })}
              </Command.Group>
            )}

            {/* Panels */}
            <Command.Group heading="Panels" className="px-1 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <CommandItem
                onSelect={() => runCommand("panel:tafsir", () => addPanel("tafsir"))}
              >
                <BookOpen className="h-4 w-4" />
                Open Tafsir
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand("panel:hadith", () => addPanel("hadith"))}
              >
                <BookText className="h-4 w-4" />
                Open Hadith
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand("panel:notes", () => addPanel("notes"))}
              >
                <StickyNote className="h-4 w-4" />
                Open Notes
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand("panel:toggle", () => toggleStudyRegion())}
              >
                <Layout className="h-4 w-4" />
                Toggle Study Region
              </CommandItem>
            </Command.Group>

            {/* Presets */}
            <Command.Group heading="Workspace Presets" className="px-1 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {WORKSPACE_PRESETS.map((preset) => (
                <CommandItem
                  key={preset.id}
                  onSelect={() => runCommand(`preset:${preset.id}`, () => applyPreset(preset.id as WorkspacePresetId))}
                >
                  <Layout className="h-4 w-4" />
                  {preset.label}
                  <span className="ml-auto text-[10px] text-muted-foreground">{preset.description}</span>
                </CommandItem>
              ))}
            </Command.Group>

            {/* Themes */}
            <Command.Group heading="Themes" className="px-1 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {THEMES.map((theme) => (
                <CommandItem
                  key={theme.name}
                  onSelect={() => runCommand(`theme:${theme.name}`, () => updatePreferences({ themeName: theme.name }))}
                >
                  <Palette className="h-4 w-4" />
                  {theme.label}
                </CommandItem>
              ))}
            </Command.Group>

            {/* Settings */}
            <Command.Group heading="Settings" className="px-1 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <CommandItem
                onSelect={() => runCommand("settings:font-up", () => updatePreferences({ arabicFontSize: "xl" }))}
              >
                <Settings2 className="h-4 w-4" />
                Increase Arabic Font Size
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand("settings:font-down", () => updatePreferences({ arabicFontSize: "md" }))}
              >
                <Settings2 className="h-4 w-4" />
                Decrease Arabic Font Size
              </CommandItem>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-fast data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
    >
      {children}
    </Command.Item>
  );
}
