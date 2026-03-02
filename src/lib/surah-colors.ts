export const SURAH_PALETTE = [
  { id: "pink",     bg: "var(--surah-pink-bg)",     accent: "var(--surah-pink-accent)",     label: "var(--surah-pink-label)",     text: "var(--surah-pink-text)" },
  { id: "teal",     bg: "var(--surah-teal-bg)",     accent: "var(--surah-teal-accent)",     label: "var(--surah-teal-label)",     text: "var(--surah-teal-text)" },
  { id: "lavender", bg: "var(--surah-lavender-bg)", accent: "var(--surah-lavender-accent)", label: "var(--surah-lavender-label)", text: "var(--surah-lavender-text)" },
] as const;

export type SurahColor = (typeof SURAH_PALETTE)[number];

/** Deterministic color for any surah — same surah = same color everywhere */
export function getSurahColor(surahId: number): SurahColor {
  return SURAH_PALETTE[(surahId - 1) % SURAH_PALETTE.length]!;
}

/** Explicit color assignments for known note tags — ensures distinct colors */
const NOTE_TAG_COLORS: Record<string, SurahColor> = {
  reflection: SURAH_PALETTE[0]!, // pink
  question: SURAH_PALETTE[2]!,   // lavender
  connection: SURAH_PALETTE[1]!,  // teal
};

/** Get color for a note tag — explicit mapping for known tags, hash for custom ones */
export function getTagColor(tag: string): SurahColor {
  const explicit = NOTE_TAG_COLORS[tag.toLowerCase()];
  if (explicit) return explicit;
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = ((hash << 5) - hash + tag.charCodeAt(i)) | 0;
  return SURAH_PALETTE[((hash % SURAH_PALETTE.length) + SURAH_PALETTE.length) % SURAH_PALETTE.length]!;
}
