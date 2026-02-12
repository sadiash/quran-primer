const EASTERN_ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

export function toEasternArabicNumeral(num: number): string {
  return String(num)
    .split("")
    .map((d) => EASTERN_ARABIC_DIGITS[Number(d)]!)
    .join("");
}
