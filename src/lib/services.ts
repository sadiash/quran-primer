import "server-only";

import { container } from "@/lib/di";
import { QuranService } from "@/core/services/quran-service";
import { QuranLocalAdapter } from "@/infrastructure/adapters/quran-local-adapter";
import { QuranTranslationAdapter } from "@/infrastructure/adapters/quran-translation-adapter";
import { TafsirAdapter } from "@/infrastructure/adapters/tafsir-adapter";
import { AudioAdapter } from "@/infrastructure/adapters/audio-adapter";
import { HadithAdapter } from "@/infrastructure/adapters/hadith-adapter";
import type { HadithPort } from "@/core/ports";

const QURAN_SERVICE_TOKEN = "QuranService";
const HADITH_ADAPTER_TOKEN = "HadithAdapter";

function ensureRegistered() {
  if (!container.has(QURAN_SERVICE_TOKEN)) {
    container.register(QURAN_SERVICE_TOKEN, () => {
      const quran = new QuranLocalAdapter();
      const translations = new QuranTranslationAdapter();
      const tafsir = new TafsirAdapter();
      const audio = new AudioAdapter();
      return new QuranService({ quran, translations, tafsir, audio });
    });
  }

  if (!container.has(HADITH_ADAPTER_TOKEN)) {
    container.register(HADITH_ADAPTER_TOKEN, () => new HadithAdapter());
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
