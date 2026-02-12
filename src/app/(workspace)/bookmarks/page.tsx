import type { Metadata } from "next";
import { BookmarksList } from "@/presentation/components/study";

export const metadata: Metadata = {
  title: "Bookmarks — The Primer",
};

export default function BookmarksPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Bookmarks</h1>
      <BookmarksList />
    </div>
  );
}
