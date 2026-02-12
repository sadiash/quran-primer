import type { Metadata } from "next";
import { NotesList } from "@/presentation/components/study";

export const metadata: Metadata = {
  title: "Notes — The Primer",
};

export default function NotesPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Notes</h1>
      <NotesList />
    </div>
  );
}
