import type { Tafsir, TafsirResource } from "@/core/types";

/** Access to Quran tafsir (commentary) */
export interface TafsirPort {
  getAvailableTafsirs(): Promise<TafsirResource[]>;
  getTafsir(verseKey: string, tafsirId: number): Promise<Tafsir | null>;
}
