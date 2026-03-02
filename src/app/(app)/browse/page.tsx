import { Suspense } from "react";
import { getQuranService } from "@/lib/services";
import { BrowsePageClient } from "./browse-client";

export const metadata = {
  title: "Browse — The Primer",
  description: "Browse all 114 surahs of the Quran and hadith collections.",
};

export default async function BrowsePage() {
  const surahs = await getQuranService().getAllSurahs();

  return (
    <Suspense>
      <BrowsePageClient surahs={surahs} />
    </Suspense>
  );
}
