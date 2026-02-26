/** Study-related domain types — bookmarks, notes, progress, preferences */

export interface Bookmark {
  id: string;
  verseKey: string;
  surahId: number;
  note: string;
  createdAt: Date;
}

export interface LinkedResource {
  type: "hadith" | "tafsir";
  label: string;       // e.g., "Bukhari #1" or "Ibn Kathir on 2:255"
  preview: string;     // first ~200 chars of text
  sourceUrl?: string;  // sunnah.com link for hadith
  metadata?: Record<string, string>; // collection, hadithNumber, tafsirId, etc.
}

export interface Note {
  id: string;
  title?: string;         // Optional title, displayed as card heading
  verseKeys: string[];    // ["1:1", "2:255"] or [] for standalone
  surahIds: number[];     // [1] for whole-surah link, or []
  content: string;
  contentJson?: string;   // TipTap JSON for rich text, alongside plain text for backward compat
  tags: string[];
  pinned?: boolean;       // Pinned notes appear at the top regardless of sort
  linkedResources?: LinkedResource[]; // Saved hadith/tafsir references
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  surahId: number;
  lastVerseKey: string;
  lastVerseNumber: number;
  completedVerses: number;
  totalVerses: number;
  updatedAt: Date;
}

export type ThemeMode = "light" | "dark" | "system";
export type ArabicFont = "uthmani" | "simple";
export type ArabicFontSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type TranslationFontSize = "sm" | "md" | "lg" | "xl";
export type TranslationColorSlot = 1 | 2 | 3 | 4 | 5 | 6;
export type TranslationFontFamily = "sans" | "serif";

export interface TranslationConfig {
  translationId: number;
  order: number;
  fontSize: TranslationFontSize;
  colorSlot: TranslationColorSlot;
  fontFamily?: TranslationFontFamily;
  bold?: boolean;
}
export type TranslationLayout = "stacked" | "columnar";
export type ReadingDensity = "comfortable" | "compact" | "dense";
export type ReadingFlow = "prose" | "blocks" | "theater" | "mushaf" | "focus";

export type ThemeName =
  | "library"
  | "observatory"
  | "amethyst"
  | "cosmos"
  | "midnight"
  | "sahara"
  | "garden"
  | "matrix";

export type PaperTexture = "auto" | "none" | "parchment" | "silk" | "canvas" | "watercolor";

export interface UserPreferences {
  id: string; // "default" for local-only, or userId
  theme: ThemeMode;
  themeName: ThemeName;
  arabicFont: ArabicFont;
  arabicFontSize: ArabicFontSize;
  translationFontSize: TranslationFontSize;
  showTranslation: boolean;
  defaultTranslationId: number;
  activeTranslationIds: number[];
  translationLayout: TranslationLayout;
  showArabic: boolean;
  showVerseNumbers: boolean;
  showSurahHeaders: boolean;
  showBismillah: boolean;
  defaultReciterId: number;
  activeTafsirIds: number[];
  activeHadithCollections: string[];
  visibleTranslationIds?: number[];
  translationConfigs?: TranslationConfig[];
  showConcepts: boolean;
  conceptMaxVisible: number;    // 3 | 5 | 10 | 0 (0 = show all)
  conceptColorSlot: number;     // 0 = muted/default, 1-6 = translation color slots
  zenMode: boolean;
  readingDensity: ReadingDensity;
  readingFlow: ReadingFlow;
  paperTexture: PaperTexture;
  onboardingComplete: boolean;
  updatedAt: Date;
}

/** Convert a loosely-typed storage record to a strictly-typed UserPreferences. */
export function toUserPreferences(raw: {
  id: string;
  theme: string;
  themeName?: string | null;
  arabicFont: string;
  arabicFontSize: string;
  translationFontSize: string;
  showTranslation: boolean;
  defaultTranslationId: number;
  activeTranslationIds?: number[] | null;
  translationLayout?: string | null;
  showArabic?: boolean | null;
  showVerseNumbers?: boolean | null;
  showSurahHeaders?: boolean | null;
  showBismillah?: boolean | null;
  defaultReciterId: number;
  activeTafsirIds?: number[] | null;
  activeHadithCollections?: string[] | null;
  visibleTranslationIds?: number[] | null;
  translationConfigs?: { translationId: number; order: number; fontSize: string; colorSlot: number; fontFamily?: string | null; bold?: boolean | null }[] | null;
  showConcepts?: boolean | null;
  conceptMaxVisible?: number | null;
  conceptColorSlot?: number | null;
  zenMode?: boolean | null;
  readingDensity?: string | null;
  readingFlow?: string | null;
  paperTexture?: string | null;
  onboardingComplete?: boolean | null;
  updatedAt: Date;
}): UserPreferences {
  return {
    id: raw.id,
    theme: raw.theme as ThemeMode,
    themeName: (raw.themeName ?? "library") as ThemeName,
    arabicFont: raw.arabicFont as ArabicFont,
    arabicFontSize: raw.arabicFontSize as ArabicFontSize,
    translationFontSize: raw.translationFontSize as TranslationFontSize,
    showTranslation: raw.showTranslation,
    defaultTranslationId: raw.defaultTranslationId,
    activeTranslationIds: raw.activeTranslationIds ?? [1001],
    translationLayout: (raw.translationLayout === "columnar" ? "columnar" : "stacked") as TranslationLayout,
    showArabic: raw.showArabic ?? true,
    showVerseNumbers: raw.showVerseNumbers ?? true,
    showSurahHeaders: raw.showSurahHeaders ?? true,
    showBismillah: raw.showBismillah ?? true,
    defaultReciterId: raw.defaultReciterId,
    activeTafsirIds: raw.activeTafsirIds ?? [74],
    activeHadithCollections: raw.activeHadithCollections ?? ["bukhari", "muslim"],
    visibleTranslationIds: raw.visibleTranslationIds ?? undefined,
    translationConfigs: raw.translationConfigs?.map((c) => ({
      translationId: c.translationId,
      order: c.order,
      fontSize: c.fontSize as TranslationFontSize,
      colorSlot: c.colorSlot as TranslationColorSlot,
      fontFamily: (c.fontFamily as TranslationFontFamily) ?? undefined,
      bold: c.bold ?? undefined,
    })) ?? undefined,
    showConcepts: raw.showConcepts ?? true,
    conceptMaxVisible: raw.conceptMaxVisible ?? 5,
    conceptColorSlot: raw.conceptColorSlot ?? 0,
    zenMode: raw.zenMode ?? false,
    readingDensity: (raw.readingDensity as ReadingDensity) ?? "compact",
    readingFlow: (raw.readingFlow as ReadingFlow) ?? "blocks",
    paperTexture: (raw.paperTexture as PaperTexture) ?? "auto",
    onboardingComplete: raw.onboardingComplete ?? false,
    updatedAt: raw.updatedAt,
  };
}

/**
 * Merge saved TranslationConfigs with the current activeTranslationIds,
 * auto-assigning defaults for any translation missing an explicit config.
 */
export function getResolvedTranslationConfigs(
  activeIds: number[],
  configs: TranslationConfig[] | undefined,
  globalFontSize: TranslationFontSize,
): TranslationConfig[] {
  const configMap = new Map<number, TranslationConfig>();
  if (configs) {
    for (const c of configs) configMap.set(c.translationId, c);
  }

  const resolved: TranslationConfig[] = [];
  for (let i = 0; i < activeIds.length; i++) {
    const id = activeIds[i]!;
    const existing = configMap.get(id);
    resolved.push(
      existing ?? {
        translationId: id,
        order: i,
        fontSize: globalFontSize,
        colorSlot: ((i % 6) + 1) as TranslationColorSlot,
        fontFamily: "sans" as TranslationFontFamily,
      },
    );
  }

  // Sort by saved order
  resolved.sort((a, b) => a.order - b.order);

  // Re-normalize order to be contiguous 0..n-1
  for (let i = 0; i < resolved.length; i++) {
    resolved[i] = { ...resolved[i]!, order: i };
  }

  return resolved;
}

/** Human-readable location label for a note */
export function noteLocationLabel(
  note: Note,
  getSurahName: (id: number) => string,
): string {
  const totalRefs = note.verseKeys.length + note.surahIds.length;
  if (totalRefs === 0) return "Standalone";
  if (totalRefs === 1) {
    if (note.verseKeys.length === 1) {
      const parts = note.verseKeys[0]!.split(":");
      return `${getSurahName(Number(parts[0]))} ${parts[0]}:${parts[1]}`;
    }
    return `${getSurahName(note.surahIds[0]!)} (surah)`;
  }
  return `${totalRefs} references`;
}
