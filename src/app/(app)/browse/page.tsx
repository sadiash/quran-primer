import { getQuranService } from "@/lib/services";
import { SurahBrowser } from "@/presentation/components/quran/surah-browser";
import { PageHeader } from "@/presentation/components/layout/page-header";

export const metadata = {
  title: "Browse Surahs — The Primer",
  description: "Browse all 114 surahs of the Quran.",
};

export default async function BrowsePage() {
  const surahs = await getQuranService().getAllSurahs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <PageHeader title="Browse Surahs" subtitle="All 114 surahs of the Quran" />
      <div className="mt-6">
        <SurahBrowser surahs={surahs} />
      </div>
    </div>
  );
}
