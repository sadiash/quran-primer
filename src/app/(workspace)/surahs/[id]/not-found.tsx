import Link from "next/link";

export default function SurahNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold">Surah Not Found</h1>
      <p className="mb-6 text-muted-foreground">
        The surah you&apos;re looking for doesn&apos;t exist. There are 114 surahs in the Quran.
      </p>
      <Link
        href="/surahs"
        className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft-sm transition-smooth hover:bg-primary/90"
      >
        Browse Surahs
      </Link>
    </div>
  );
}
