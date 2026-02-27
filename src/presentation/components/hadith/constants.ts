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
  bukhari: { name: "Sahih al-Bukhari", accentColor: "var(--surah-teal-accent)", bg: "var(--surah-teal-bg)", labelColor: "var(--surah-teal-label)" },
  muslim: { name: "Sahih Muslim", accentColor: "var(--surah-teal-accent)", bg: "var(--surah-teal-bg)", labelColor: "var(--surah-teal-label)" },
  abudawud: { name: "Sunan Abu Dawud", accentColor: "var(--surah-yellow-accent)", bg: "var(--surah-yellow-bg)", labelColor: "var(--surah-yellow-label)" },
  tirmidhi: { name: "Jami at-Tirmidhi", accentColor: "var(--surah-lavender-accent)", bg: "var(--surah-lavender-bg)", labelColor: "var(--surah-lavender-label)" },
  nasai: { name: "Sunan an-Nasa'i", accentColor: "var(--surah-pink-accent)", bg: "var(--surah-pink-bg)", labelColor: "var(--surah-pink-label)" },
  ibnmajah: { name: "Sunan Ibn Majah", accentColor: "var(--surah-yellow-accent)", bg: "var(--surah-yellow-bg)", labelColor: "var(--surah-yellow-label)" },
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
  sahih: "text-[var(--surah-teal-label)] bg-[var(--surah-teal-bg)]",
  hasan: "text-[var(--surah-yellow-label)] bg-[var(--surah-yellow-bg)]",
  daif: "text-[var(--surah-pink-label)] bg-[var(--surah-pink-bg)]",
  fabricated: "text-[var(--surah-pink-label)] bg-[var(--surah-pink-bg)]",
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
