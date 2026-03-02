"use client";

import { PageHeader } from "@/presentation/components/layout/page-header";
import { HandshakeIcon } from "@phosphor-icons/react";

export default function AcknowledgementsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        title="Acknowledgements"
        subtitle="Standing on the shoulders of giants."
        icon={HandshakeIcon}
      />

      <div className="mt-8 space-y-10">
        {/* Philosophy */}
        <section>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Primer is built entirely on open data and open-source software.
            The Quran belongs to everyone &mdash; a study tool for the Quran should
            not be locked behind proprietary walls. Every dataset, API, font, and
            library listed below made this project possible.
          </p>
        </section>

        {/* Quranic Text */}
        <Section title="Quranic Text">
          <CreditCard
            name="Quran Foundation"
            description="Arabic text (Uthmani script), verse metadata, surah information, audio recitations, and reciter data."
            url="https://api-docs.quran.com"
            license="Quran.com API v4"
          />
        </Section>

        {/* Translations */}
        <Section title="Translations">
          <CreditCard
            name="fawazahmed0 / quran-api"
            description="Six English translations bundled locally: The Clear Quran (Mustafa Khattab), Abdullah Yusuf Ali, Marmaduke Pickthall, Al-Hilali & Muhsin Khan, M.A.S. Abdel Haleem, and Tafhim-ul-Quran (Abul Ala Maududi)."
            url="https://github.com/fawazahmed0/quran-api"
            license="Public Domain (Unlicense)"
          />
        </Section>

        {/* Tafsir */}
        <Section title="Tafsir (Commentary)">
          <CreditCard
            name="spa5k / tafsir_api"
            description="Three English tafsirs: Al-Jalalayn (al-Mahalli & as-Suyuti), Tafsir Ibn Kathir (abridged), and Tazkirul Quran (Maulana Wahiduddin Khan)."
            url="https://github.com/spa5k/tafsir_api"
            license="MIT"
          />
        </Section>

        {/* Hadith */}
        <Section title="Hadith Collections">
          <CreditCard
            name="meeAtif / hadith_datasets"
            description="33,738 hadiths across six canonical collections: Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, and Sunan Ibn Majah. Arabic text, English translation, and grading included."
            url="https://huggingface.co/datasets/meeAtif/hadith_datasets"
            license="MIT"
          />
        </Section>

        {/* Knowledge Graph */}
        <Section title="Knowledge Graph & Ontology">
          <CreditCard
            name="Semantic Hadith Knowledge Graph v2"
            description="RDF-based knowledge graph linking hadiths to topics, Quranic verses, and named entities. Powers the concept search, topic browsing, and cross-reference features."
            url="https://www.semantichadith.com"
            license="SemanticHadith.com"
          />
          <CreditCard
            name="Scripturas.info"
            description="Cross-scripture reference API providing connections between Quran, Bible, and Torah verses."
            url="https://scripturas.info"
            license="Scripturas.info API"
          />
        </Section>

        {/* Audio */}
        <Section title="Audio & Recitation">
          <CreditCard
            name="QuranCDN"
            description="Verse-by-verse audio recitations from dozens of reciters, delivered via the Quran.com audio CDN."
            url="https://audio.qurancdn.com"
            license="Quran Foundation"
          />
        </Section>

        {/* Fonts */}
        <Section title="Fonts">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <FontCard name="Amiri" use="Arabic display & titles" url="https://fonts.google.com/specimen/Amiri" />
            <FontCard name="Scheherazade New" use="Arabic reading text" url="https://fonts.google.com/specimen/Scheherazade+New" />
            <FontCard name="Space Grotesk" use="UI headings & labels" url="https://fonts.google.com/specimen/Space+Grotesk" />
            <FontCard name="Space Mono" use="Monospace & metadata" url="https://fonts.google.com/specimen/Space+Mono" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-2">
            All fonts licensed under the SIL Open Font License (OFL)
          </p>
        </Section>

        {/* Framework & Core */}
        <Section title="Framework">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <LibCard name="Next.js" version="16" url="https://nextjs.org" />
            <LibCard name="React" version="19" url="https://react.dev" />
            <LibCard name="TypeScript" version="5" url="https://typescriptlang.org" />
            <LibCard name="Tailwind CSS" version="4" url="https://tailwindcss.com" />
            <LibCard name="Vercel" url="https://vercel.com" />
            <LibCard name="Node.js" url="https://nodejs.org" />
          </div>
        </Section>

        {/* UI Libraries */}
        <Section title="UI & Components">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <LibCard name="Radix UI" url="https://radix-ui.com" />
            <LibCard name="Phosphor Icons" url="https://phosphoricons.com" />
            <LibCard name="Framer Motion" url="https://motion.dev" />
            <LibCard name="TipTap" url="https://tiptap.dev" />
            <LibCard name="Vaul" url="https://github.com/emilkowalski/vaul" />
            <LibCard name="react-resizable-panels" url="https://github.com/bvaughn/react-resizable-panels" />
          </div>
        </Section>

        {/* Data & State */}
        <Section title="Data & State">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <LibCard name="Dexie.js" url="https://dexie.org" />
            <LibCard name="TanStack Query" url="https://tanstack.com/query" />
            <LibCard name="D3.js" url="https://d3js.org" />
            <LibCard name="DOMPurify" url="https://github.com/cure53/DOMPurify" />
            <LibCard name="Zod" url="https://zod.dev" />
            <LibCard name="Pino" url="https://getpino.io" />
          </div>
        </Section>

        {/* Inspiration */}
        <Section title="Inspiration">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The name &ldquo;The Primer&rdquo; is inspired by Neal Stephenson&apos;s{" "}
            <em>The Diamond Age</em> &mdash; a book that teaches by meeting readers
            where they are, adapting to curiosity, and growing with them.
          </p>
        </Section>

        {/* License */}
        <section className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Primer is open source under the{" "}
            <a
              href="https://github.com/sadiash/quran-primer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              AGPL-3.0 license
            </a>
            . All bundled datasets retain their original licenses as noted above.
            This project is not affiliated with any of the listed organizations.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground border-b border-border pb-2 mb-4">
        [ {title} ]
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function CreditCard({
  name,
  description,
  url,
  license,
}: {
  name: string;
  description: string;
  url: string;
  license: string;
}) {
  return (
    <div className="border border-border p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-foreground hover:opacity-70 transition-opacity underline underline-offset-2"
        >
          {name}
        </a>
        <span className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5">
          {license}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function FontCard({ name, use, url }: { name: string; use: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-border p-3 hover:bg-surface transition-colors"
    >
      <p className="text-sm font-bold text-foreground">{name}</p>
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">{use}</p>
    </a>
  );
}

function LibCard({ name, version, url }: { name: string; version?: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-border p-3 hover:bg-surface transition-colors"
    >
      <p className="text-xs font-bold text-foreground">
        {name}
        {version && (
          <span className="ml-1.5 font-mono text-[9px] font-normal text-muted-foreground">v{version}</span>
        )}
      </p>
    </a>
  );
}
