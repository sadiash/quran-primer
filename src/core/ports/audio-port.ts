import type { AudioRecitation, Reciter } from "@/core/types";

/** Access to Quran audio recitations */
export interface AudioPort {
  getReciters(): Promise<Reciter[]>;
  getRecitation(
    surahId: number,
    reciterId: number,
  ): Promise<AudioRecitation[]>;
  getVerseAudioUrl(verseKey: string, reciterId: number): Promise<string | null>;
}
