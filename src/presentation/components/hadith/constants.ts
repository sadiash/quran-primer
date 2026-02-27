import DOMPurify from "dompurify";

export const COLLECTIONS = [
  { id: "bukhari", label: "Bukhari" },
  { id: "muslim", label: "Muslim" },
  { id: "abudawud", label: "Abu Dawud" },
  { id: "tirmidhi", label: "Tirmidhi" },
  { id: "nasai", label: "Nasa'i" },
  { id: "ibnmajah", label: "Ibn Majah" },
] as const;

/** Display-friendly collection names + colors (inline styles to avoid Tailwind purge) */
export const COLLECTION_META: Record<string, { name: string; accentColor: string; bg: string; labelColor: string }> = {
  bukhari: { name: "Sahih al-Bukhari", accentColor: "#78d5c4", bg: "#f0fdf9", labelColor: "#3ba892" },
  muslim: { name: "Sahih Muslim", accentColor: "#78d5c4", bg: "#f0fdf9", labelColor: "#3ba892" },
  abudawud: { name: "Sunan Abu Dawud", accentColor: "#e8e337", bg: "#fefce8", labelColor: "#b5a600" },
  tirmidhi: { name: "Jami at-Tirmidhi", accentColor: "#c4b5e0", bg: "#f5f3ff", labelColor: "#8b6fc0" },
  nasai: { name: "Sunan an-Nasa'i", accentColor: "#f5a0c0", bg: "#fdf2f8", labelColor: "#d4608a" },
  ibnmajah: { name: "Sunan Ibn Majah", accentColor: "#e8e337", bg: "#fefce8", labelColor: "#b5a600" },
};

/* ─── Grade helpers ─── */

export interface ParsedGrade {
  label: string;
  grader: string | null;
}

export function parseGrade(raw: string | null): ParsedGrade | null {
  if (!raw) return null;
  const m = raw.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m && m[1] && m[2]) return { label: m[1].trim(), grader: m[2].trim() };
  return { label: raw.trim(), grader: null };
}

export type GradeCategory = "sahih" | "hasan" | "daif" | "fabricated" | "unknown";

export function categorizeGrade(label: string): GradeCategory {
  const lower = label.toLowerCase();
  if (lower.includes("maudu") || lower.includes("mawdu") || lower.includes("fabricat") || lower.includes("munkar"))
    return "fabricated";
  if (lower.includes("da'if") || lower.includes("daif") || lower.includes("da if") || lower.includes("da,if") || lower.includes("da`if") || lower.includes("weak"))
    return "daif";
  if (lower.includes("hasan")) return "hasan";
  if (lower.includes("sahih") || lower.includes("sah,")) return "sahih";
  return "unknown";
}

export const GRADE_STYLES: Record<GradeCategory, string> = {
  sahih: "text-[#3ba892] bg-[#f0fdf9]",
  hasan: "text-[#b5a600] bg-[#fefce8]",
  daif: "text-[#d4608a] bg-[#fdf2f8]",
  fabricated: "text-[#c4425a] bg-[#fdf2f8]",
  unknown: "text-muted-foreground bg-muted",
};

export type GradeFilter = "all" | "sahih" | "hasan" | "daif";

export const GRADE_FILTERS: { id: GradeFilter; label: string; style: string }[] = [
  { id: "all", label: "All Grades", style: "" },
  { id: "sahih", label: "Sahih", style: "text-emerald-700 dark:text-emerald-400" },
  { id: "hasan", label: "Hasan", style: "text-amber-700 dark:text-amber-400" },
  { id: "daif", label: "Da'if", style: "text-orange-700 dark:text-orange-400" },
];

export function sanitizeHadithHtml(html: string): string {
  if (typeof window === "undefined") return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "b", "i", "em", "strong", "span"],
    ALLOWED_ATTR: ["class"],
  });
}
