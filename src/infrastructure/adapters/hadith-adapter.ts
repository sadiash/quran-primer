/** Fetches hadith data — uses a simple search-based approach */

import type { HadithPort } from "@/core/ports";
import type { Hadith, HadithBook, HadithCollection } from "@/core/types";
import { HttpClient } from "@/infrastructure/http";

const DEFAULT_BASE_URL = "https://api.sunnah.com/v1";

interface SunnahApiHadithResponse {
  data: Array<{
    hadithNumber: string;
    bookNumber: string;
    collection: string;
    hadith: Array<{
      lang: string;
      body: string;
      grades: Array<{ grade: string }>;
    }>;
  }>;
}

interface SunnahApiCollectionsResponse {
  data: Array<{
    name: string;
    collection: Array<{ lang: string; title: string }>;
    totalHadith: number;
  }>;
}

export class HadithAdapter implements HadithPort {
  private readonly http: HttpClient;

  constructor(baseUrl?: string, apiKey?: string) {
    this.http = new HttpClient({
      baseUrl: baseUrl ?? DEFAULT_BASE_URL,
      retries: 1,
      backoffMs: 500,
      headers: apiKey ? { "X-API-Key": apiKey } : {},
    });
  }

  async getCollections(): Promise<HadithCollection[]> {
    try {
      const data =
        await this.http.get<SunnahApiCollectionsResponse>("/collections");

      return data.data.map((c) => ({
        id: c.name,
        name:
          c.collection.find((t) => t.lang === "en")?.title ?? c.name,
        hadithCount: c.totalHadith,
      }));
    } catch {
      return [];
    }
  }

  async searchHadith(
    query: string,
    collection?: string,
  ): Promise<Hadith[]> {
    if (!query.trim()) return [];

    try {
      const collectionPath = collection ? `/${collection}` : "";
      const data = await this.http.get<SunnahApiHadithResponse>(
        `${collectionPath}/hadiths?q=${encodeURIComponent(query)}&limit=20`,
      );

      return data.data.map((h) => {
        const english = h.hadith.find((t) => t.lang === "en");
        return {
          id: Number(h.hadithNumber) || 0,
          collection: h.collection,
          bookNumber: h.bookNumber,
          hadithNumber: h.hadithNumber,
          text: english?.body ?? "",
          grade: english?.grades[0]?.grade ?? null,
          narratedBy: null,
          reference: null,
          inBookReference: null,
        };
      });
    } catch {
      return [];
    }
  }

  async browseBooks(_collection: string): Promise<HadithBook[]> {
    // Browse is only supported via local data
    return [];
  }

  async browseHadiths(_collection: string, _bookNumber: number): Promise<Hadith[]> {
    // Browse is only supported via local data
    return [];
  }

  async getHadithsByOntologyIds(_ids: string[]): Promise<Hadith[]> {
    // Ontology resolution is only supported via local data
    return [];
  }
}
