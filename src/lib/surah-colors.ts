export const SURAH_PALETTE = [
  { id: "yellow",   bg: "#fefce8", accent: "#e8e337", label: "#b5a600", text: "#854d0e" },
  { id: "pink",     bg: "#fdf2f8", accent: "#f5a0c0", label: "#d4608a", text: "#9d174d" },
  { id: "teal",     bg: "#f0fdf9", accent: "#78d5c4", label: "#3ba892", text: "#115e59" },
  { id: "lavender", bg: "#f5f3ff", accent: "#c4b5e0", label: "#8b6fc0", text: "#5b21b6" },
] as const;

export type SurahColor = (typeof SURAH_PALETTE)[number];

/** Deterministic color for any surah — same surah = same color everywhere */
export function getSurahColor(surahId: number): SurahColor {
  return SURAH_PALETTE[(surahId - 1) % SURAH_PALETTE.length]!;
}
