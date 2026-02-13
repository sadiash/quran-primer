import { getQuranService } from "@/lib/services";
import { SurahBrowser } from "@/presentation/components/quran/surah-browser";

export const metadata = {
  title: "Browse Surahs — The Primer",
  description: "Browse all 114 surahs of the Quran.",
};

export default async function BrowsePage() {
  const surahs = await getQuranService().getAllSurahs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-semibold text-foreground">Browse Surahs</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        All 114 surahs of the Quran
      </p>
      <div className="mt-6">
        <SurahBrowser surahs={surahs} />
      </div>
    </div>
  );
}
