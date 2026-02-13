import "server-only";

import { container } from "@/lib/di";
import { QuranService } from "@/core/services/quran-service";
import { QuranLocalAdapter } from "@/infrastructure/adapters/quran-local-adapter";
import { QuranTranslationAdapter } from "@/infrastructure/adapters/quran-translation-adapter";
import { TranslationLocalAdapter } from "@/infrastructure/adapters/translation-local-adapter";
import { TafsirAdapter } from "@/infrastructure/adapters/tafsir-adapter";
import { TafsirLocalAdapter } from "@/infrastructure/adapters/tafsir-local-adapter";
import { AudioAdapter } from "@/infrastructure/adapters/audio-adapter";
import { HadithAdapter } from "@/infrastructure/adapters/hadith-adapter";
import { HadithLocalAdapter } from "@/infrastructure/adapters/hadith-local-adapter";
import { CrossReferenceAdapter } from "@/infrastructure/adapters/cross-reference-adapter";
import type { HadithPort, CrossReferencePort } from "@/core/ports";

const QURAN_SERVICE_TOKEN = "QuranService";
const HADITH_ADAPTER_TOKEN = "HadithAdapter";
const CROSS_REFERENCE_ADAPTER_TOKEN = "CrossReferenceAdapter";

function ensureRegistered() {
  if (!container.has(QURAN_SERVICE_TOKEN)) {
    container.register(QURAN_SERVICE_TOKEN, () => {
      const quran = new QuranLocalAdapter();
      // Local-first: read bundled translations, fall back to Quran.com API
      const translations = new TranslationLocalAdapter(
        new QuranTranslationAdapter(),
      );
      // Local-first: read bundled tafsirs, fall back to Quran.com API
      const tafsir = new TafsirLocalAdapter(new TafsirAdapter());
      const audio = new AudioAdapter();
      return new QuranService({ quran, translations, tafsir, audio });
    });
  }

  if (!container.has(HADITH_ADAPTER_TOKEN)) {
    // Local-first: search bundled hadith, fall back to Sunnah.com API
    container.register(
      HADITH_ADAPTER_TOKEN,
      () => new HadithLocalAdapter(new HadithAdapter()),
    );
  }

  if (!container.has(CROSS_REFERENCE_ADAPTER_TOKEN)) {
    container.register(
      CROSS_REFERENCE_ADAPTER_TOKEN,
      () => new CrossReferenceAdapter(),
    );
  }
}

export function getQuranService(): QuranService {
  ensureRegistered();
  return container.resolve<QuranService>(QURAN_SERVICE_TOKEN);
}

export function getHadithAdapter(): HadithPort {
  ensureRegistered();
  return container.resolve<HadithPort>(HADITH_ADAPTER_TOKEN);
}

export function getCrossReferenceAdapter(): CrossReferencePort {
  ensureRegistered();
  return container.resolve<CrossReferencePort>(CROSS_REFERENCE_ADAPTER_TOKEN);
}
