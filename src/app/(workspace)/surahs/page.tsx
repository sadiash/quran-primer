import type { Metadata } from "next";
import { getQuranService } from "@/lib/services";
import { SurahBrowser } from "@/presentation/components/quran";

export const metadata: Metadata = {
  title: "Browse Surahs — The Primer",
};

export default async function SurahsPage() {
  const surahs = await getQuranService().getAllSurahs();
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Surahs</h1>
      <SurahBrowser surahs={surahs} />
    </div>
  );
}
