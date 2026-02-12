import type { Surah } from "@/core/types";
import { Badge } from "@/presentation/components/ui";

interface SurahHeaderProps {
  surah: Surah;
}

export function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <header className="mb-8 text-center">
      <h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[2.8]"
        dir="rtl"
        lang="ar"
        style={{ fontFamily: "var(--font-arabic-display)" }}
      >
        {surah.nameArabic}
      </h1>
      <h2 className="mt-1 text-lg sm:text-xl font-semibold">{surah.nameSimple}</h2>
      <p className="text-sm text-muted-foreground">{surah.nameTranslation}</p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <Badge variant="secondary" className="capitalize">
          {surah.revelationType}
        </Badge>
        <Badge variant="outline">{surah.versesCount} verses</Badge>
      </div>
    </header>
  );
}
