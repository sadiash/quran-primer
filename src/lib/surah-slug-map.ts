/** Map of Scripturas.info surah slugs to surah numbers (1–114) */

const SLUG_TO_SURAH: Record<string, number> = {
  alfatiha: 1,
  albaqarah: 2,
  alimran: 3,
  annisa: 4,
  almaida: 5,
  alanam: 6,
  alaraf: 7,
  alanfal: 8,
  attawbah: 9,
  yunus: 10,
  hud: 11,
  yusuf: 12,
  arrad: 13,
  ibrahim: 14,
  alhijr: 15,
  annahl: 16,
  alisra: 17,
  alkahf: 18,
  maryam: 19,
  taha: 20,
  alanbiya: 21,
  alhajj: 22,
  almuminun: 23,
  annur: 24,
  alfurqan: 25,
  ashuara: 26,
  annaml: 27,
  alqasas: 28,
  alankabut: 29,
  arrum: 30,
  luqman: 31,
  assajdah: 32,
  alahzab: 33,
  saba: 34,
  fatir: 35,
  yasin: 36,
  assaffat: 37,
  sad: 38,
  azzumar: 39,
  ghafir: 40,
  fussilat: 41,
  ashura: 42,
  azzukhruf: 43,
  addukhan: 44,
  aljathiyah: 45,
  alahqaf: 46,
  muhammad: 47,
  alfath: 48,
  alhujurat: 49,
  qaf: 50,
  adhdhariyat: 51,
  attur: 52,
  annajm: 53,
  alqamar: 54,
  arrahman: 55,
  alwaqiah: 56,
  alhadid: 57,
  almujadila: 58,
  alhashr: 59,
  almumtahina: 60,
  assaff: 61,
  aljumuah: 62,
  almunafiqun: 63,
  attaghabun: 64,
  attalaq: 65,
  attahrim: 66,
  almulk: 67,
  alqalam: 68,
  alhaqqah: 69,
  almaarij: 70,
  nuh: 71,
  aljinn: 72,
  almuzzammil: 73,
  almuddathir: 74,
  alqiyamah: 75,
  alinsan: 76,
  almursalat: 77,
  annaba: 78,
  annaziat: 79,
  abasa: 80,
  attakwir: 81,
  alinfitar: 82,
  almutaffifin: 83,
  alinshiqaq: 84,
  alburuj: 85,
  attariq: 86,
  alala: 87,
  alghashiyah: 88,
  alfajr: 89,
  albalad: 90,
  ashshams: 91,
  allail: 92,
  adduha: 93,
  ashsharh: 94,
  attin: 95,
  alalaq: 96,
  alqadr: 97,
  albayyinah: 98,
  azzalzalah: 99,
  aladiyat: 100,
  alqariah: 101,
  attakathur: 102,
  alasr: 103,
  alhumazah: 104,
  alfil: 105,
  quraysh: 106,
  almaun: 107,
  alkauthar: 108,
  alkafirun: 109,
  annasr: 110,
  allahab: 111,
  alikhlas: 112,
  alfalaq: 113,
  annas: 114,
};

/** Reverse map: surah number → slug */
const SURAH_TO_SLUG: Record<number, string> = {};
for (const [slug, num] of Object.entries(SLUG_TO_SURAH)) {
  SURAH_TO_SLUG[num] = slug;
}

/**
 * Convert a Scripturas-style surah slug to a surah number.
 * Returns undefined if the slug is not recognised.
 */
export function surahSlugToNumber(slug: string): number | undefined {
  // Normalise: lower-case, strip hyphens / underscores
  const normalised = slug.toLowerCase().replace(/[-_]/g, "");
  return SLUG_TO_SURAH[normalised];
}

/**
 * Convert a surah number (1-114) to the canonical slug.
 * Returns undefined if the number is out of range.
 */
export function surahNumberToSlug(num: number): string | undefined {
  return SURAH_TO_SLUG[num];
}

/**
 * Attempt to parse a Scripturas verse identifier and return a Quran verse key.
 * Scripturas identifiers follow the pattern: `<surahSlug>:<verseNumber>` or similar.
 * Returns undefined if parsing fails.
 */
export function scripturasIdToVerseKey(id: string): string | undefined {
  // Handle patterns like "albaqarah:247", "albaqarah-247", "albaqarah/247"
  const match = id.match(/^([a-z_-]+)[:/\-_](\d+)$/i);
  if (!match) return undefined;

  const slug = match[1]!;
  const verseNum = match[2]!;
  const surahNum = surahSlugToNumber(slug);
  if (!surahNum) return undefined;

  return `${surahNum}:${verseNum}`;
}
