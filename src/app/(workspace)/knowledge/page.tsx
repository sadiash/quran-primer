import type { Metadata } from "next";
import Link from "next/link";
import { Brain, StickyNote, Bookmark, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Knowledge — The Primer",
};

interface KnowledgeCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function KnowledgeCard({ href, icon, title, description }: KnowledgeCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm p-5 transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

export default function KnowledgePage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Knowledge</h1>
      <p className="mb-8 text-muted-foreground">
        Your knowledge map grows as you study. Explore connections between your
        notes, bookmarks, and themes.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KnowledgeCard
          href="/knowledge/mind-map"
          icon={<Brain className="h-5 w-5 text-primary" />}
          title="Mind Map"
          description="Visualize connections between your verses, notes, and themes in an interactive graph."
        />
        <KnowledgeCard
          href="/notes"
          icon={<StickyNote className="h-5 w-5 text-primary" />}
          title="Notes"
          description="Browse and manage all your study notes across surahs and verses."
        />
        <KnowledgeCard
          href="/bookmarks"
          icon={<Bookmark className="h-5 w-5 text-primary" />}
          title="Bookmarks"
          description="View your saved verses and return to meaningful passages."
        />
      </div>
    </div>
  );
}
