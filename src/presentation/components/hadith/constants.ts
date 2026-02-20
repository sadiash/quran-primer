import DOMPurify from "dompurify";

export const COLLECTIONS = [
  { id: "bukhari", label: "Bukhari" },
  { id: "muslim", label: "Muslim" },
  { id: "abudawud", label: "Abu Dawud" },
  { id: "tirmidhi", label: "Tirmidhi" },
  { id: "nasai", label: "Nasa'i" },
  { id: "ibnmajah", label: "Ibn Majah" },
] as const;

/** Display-friendly collection names + colors (inline styles for border to avoid Tailwind purge) */
export const COLLECTION_META: Record<string, { name: string; accentColor: string; badge: string }> = {
  bukhari: { name: "Sahih al-Bukhari", accentColor: "#34d399", badge: "bg-emerald-500/15 text-emerald-400" },
  muslim: { name: "Sahih Muslim", accentColor: "#2dd4bf", badge: "bg-teal-500/15 text-teal-400" },
  abudawud: { name: "Sunan Abu Dawud", accentColor: "#38bdf8", badge: "bg-sky-500/15 text-sky-400" },
  tirmidhi: { name: "Jami at-Tirmidhi", accentColor: "#a78bfa", badge: "bg-violet-500/15 text-violet-400" },
  nasai: { name: "Sunan an-Nasa'i", accentColor: "#fb7185", badge: "bg-rose-500/15 text-rose-400" },
  ibnmajah: { name: "Sunan Ibn Majah", accentColor: "#fbbf24", badge: "bg-amber-500/15 text-amber-400" },
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
  sahih: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10",
  hasan: "text-amber-700 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/10",
  daif: "text-orange-700 bg-orange-500/10 dark:text-orange-400 dark:bg-orange-500/10",
  fabricated: "text-red-700 bg-red-500/10 dark:text-red-400 dark:bg-red-500/10",
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
