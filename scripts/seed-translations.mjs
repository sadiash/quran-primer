/**
 * Seed Translations Script
 *
 * Downloads top English translations from fawazahmed0/quran-api CDN
 * and saves them as per-surah JSON files.
 *
 * Usage: node scripts/seed-translations.mjs
 *        node scripts/seed-translations.mjs --list   (show available English editions)
 *
 * Source: https://github.com/fawazahmed0/quran-api (Public Domain)
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions";
const EDITIONS_URL = `${CDN_BASE}.json`;

const DATA_DIR = join(
  new URL(".", import.meta.url).pathname,
  "..",
  "data",
  "translations",
);

const DELAY_MS = 150;
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 1000;

/**
 * Target translations to bundle.
 * id: our internal resource ID (1001+ to avoid Quran.com ID collisions)
 * slug: fawazahmed0 edition slug (the "name" field from editions.json)
 */
const TRANSLATIONS = [
  {
    id: 1001,
    slug: "eng-mustafakhattaba",
    name: "The Clear Quran",
    authorName: "Mustafa Khattab",
    languageCode: "en",
  },
  {
    id: 1002,
    slug: "eng-abdullahyusufal",
    name: "Abdullah Yusuf Ali",
    authorName: "Abdullah Yusuf Ali",
    languageCode: "en",
  },
  {
    id: 1003,
    slug: "eng-mohammedmarmadu",
    name: "Marmaduke Pickthall",
    authorName: "Mohammed Marmaduke William Pickthall",
    languageCode: "en",
  },
  {
    id: 1004,
    slug: "eng-muhammadtaqiudd",
    name: "Al-Hilali & Muhsin Khan",
    authorName: "Muhammad Taqi-ud-Din al-Hilali & Muhammad Muhsin Khan",
    languageCode: "en",
  },
  {
    id: 1005,
    slug: "eng-abdelhaleem",
    name: "Abdel Haleem",
    authorName: "M.A.S. Abdel Haleem",
    languageCode: "en",
  },
  {
    id: 1006,
    slug: "eng-abulalamaududi",
    name: "Tafhim-ul-Quran",
    authorName: "Abul Ala Maududi",
    languageCode: "en",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const backoff = RETRY_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.warn(
          `  [retry ${attempt}/${retries}] ${err.message} — waiting ${backoff}ms`,
        );
        await sleep(backoff);
      }
    }
  }
  throw lastError;
}

function padNumber(n) {
  return String(n).padStart(3, "0");
}

// ---------------------------------------------------------------------------
// List mode: show available English editions
// ---------------------------------------------------------------------------

async function listEditions() {
  console.log("Fetching editions catalog...");
  const editions = await fetchWithRetry(EDITIONS_URL);

  const english = Object.entries(editions)
    .filter(([key]) => key.startsWith("eng"))
    .map(([key, val]) => ({
      key,
      name: val.name,
      author: val.author,
    }))
    .sort((a, b) => a.author.localeCompare(b.author));

  console.log(`\nFound ${english.length} English editions:\n`);
  for (const e of english) {
    console.log(`  ${e.name.padEnd(30)} — ${e.author}`);
  }
}

// ---------------------------------------------------------------------------
// Main: download translations
// ---------------------------------------------------------------------------

async function main() {
  if (process.argv.includes("--list")) {
    await listEditions();
    return;
  }

  // Ensure base directory exists
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  // Verify editions exist on CDN before downloading
  console.log("Verifying editions on CDN...\n");
  const editions = await fetchWithRetry(EDITIONS_URL);

  const verified = [];
  for (const t of TRANSLATIONS) {
    // editions.json uses underscores for keys but hyphens in "name"
    const editionKey = t.slug.replace(/-/g, "_");
    const edition = editions[editionKey];
    if (!edition) {
      // Try the slug directly as key
      const altEdition = editions[t.slug];
      if (!altEdition) {
        console.warn(`  WARNING: Edition "${t.slug}" not found in catalog. Skipping.`);
        continue;
      }
    }
    verified.push(t);
    console.log(`  OK: ${t.slug} — ${t.name}`);
  }

  if (verified.length === 0) {
    console.error("\nNo valid editions found. Run with --list to see available editions.");
    process.exit(1);
  }

  console.log(`\nDownloading ${verified.length} translations (114 surahs each)...\n`);

  const indexEntries = [];

  for (const t of verified) {
    const translationDir = join(DATA_DIR, t.slug);
    if (!existsSync(translationDir)) {
      mkdirSync(translationDir, { recursive: true });
    }

    console.log(`\n--- ${t.name} (${t.slug}) ---`);
    let surahsDownloaded = 0;

    for (let surahId = 1; surahId <= 114; surahId++) {
      const url = `${CDN_BASE}/${t.slug}/${surahId}.json`;
      const fileName = `${padNumber(surahId)}.json`;
      const filePath = join(translationDir, fileName);

      try {
        const data = await fetchWithRetry(url);

        // Transform from fawazahmed0 format to our format
        // Source: { chapter: [{ chapter, verse, text }] }
        const verses = (data.chapter || []).map((v) => ({
          verseKey: `${v.chapter}:${v.verse}`,
          text: v.text,
        }));

        const surahJson = { verses };
        writeFileSync(filePath, JSON.stringify(surahJson), "utf-8");
        surahsDownloaded++;

        if (surahId % 20 === 0 || surahId === 114) {
          console.log(`  ${padNumber(surahId)}/114 surahs downloaded`);
        }
      } catch (err) {
        console.error(
          `  FAILED surah ${surahId}: ${err.message}`,
        );
      }

      await sleep(DELAY_MS);
    }

    if (surahsDownloaded === 114) {
      indexEntries.push({
        id: t.id,
        name: t.name,
        authorName: t.authorName,
        languageCode: t.languageCode,
        slug: t.slug,
      });
      console.log(`  Complete: ${surahsDownloaded}/114 surahs`);
    } else {
      console.warn(
        `  Incomplete: only ${surahsDownloaded}/114 surahs downloaded`,
      );
    }
  }

  // Write index.json
  const indexPath = join(DATA_DIR, "index.json");
  writeFileSync(indexPath, JSON.stringify(indexEntries, null, 2), "utf-8");
  console.log(`\nSaved index: ${indexPath}`);
  console.log(`Translations: ${indexEntries.length} complete`);
  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
