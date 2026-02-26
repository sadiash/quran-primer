/**
 * Seed Tafsirs Script
 *
 * Downloads concise tafsirs from spa5k/tafsir_api GitHub repository
 * and saves them as per-surah JSON files.
 *
 * Usage: node scripts/seed-tafsirs.mjs
 *        node scripts/seed-tafsirs.mjs --list   (show available tafsirs)
 *
 * Source: https://github.com/spa5k/tafsir_api (MIT License)
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const RAW_BASE =
  "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir";
const EDITIONS_URL = `${RAW_BASE}/editions.json`;

const DATA_DIR = join(
  new URL(".", import.meta.url).pathname,
  "..",
  "data",
  "tafsirs",
);

const DELAY_MS = 150;
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 1000;

/**
 * Target tafsirs to bundle.
 * slug: matches directory name in spa5k/tafsir_api repo
 * id: from the editions.json catalog (spa5k assigns these)
 */
const TAFSIRS = [
  {
    slug: "en-al-jalalayn",
    name: "Al-Jalalayn",
    authorName: "Jalal ad-Din al-Mahalli & Jalal ad-Din as-Suyuti",
    languageCode: "en",
  },
  {
    slug: "en-tafisr-ibn-kathir",
    name: "Tafsir Ibn Kathir (abridged)",
    authorName: "Hafiz Ibn Kathir",
    languageCode: "en",
  },
  {
    slug: "en-tazkirul-quran",
    name: "Tazkirul Quran",
    authorName: "Maulana Wahiduddin Khan",
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
// List mode
// ---------------------------------------------------------------------------

async function listEditions() {
  console.log("Fetching tafsir editions catalog...");
  const editions = await fetchWithRetry(EDITIONS_URL);

  console.log(`\nFound ${editions.length} tafsirs:\n`);
  for (const e of editions) {
    console.log(
      `  ${e.slug.padEnd(35)} — ${e.name.padEnd(40)} [${e.language_name}]`,
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (process.argv.includes("--list")) {
    await listEditions();
    return;
  }

  // Ensure base directory
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  // Fetch editions catalog for ID lookup
  console.log("Fetching tafsir editions catalog...");
  const editions = await fetchWithRetry(EDITIONS_URL);

  const indexEntries = [];

  for (const t of TAFSIRS) {
    // Look up the ID from the catalog
    const catalogEntry = editions.find((e) => e.slug === t.slug);
    const tafsirId = catalogEntry?.id ?? 0;

    if (!catalogEntry) {
      console.warn(`  WARNING: Tafsir "${t.slug}" not found in catalog. Will try anyway.`);
    }

    const tafsirDir = join(DATA_DIR, t.slug);
    if (!existsSync(tafsirDir)) {
      mkdirSync(tafsirDir, { recursive: true });
    }

    console.log(`\n--- ${t.name} (${t.slug}, id=${tafsirId}) ---`);
    let surahsDownloaded = 0;

    for (let surahId = 1; surahId <= 114; surahId++) {
      const url = `${RAW_BASE}/${t.slug}/${surahId}.json`;
      const fileName = `${padNumber(surahId)}.json`;
      const filePath = join(tafsirDir, fileName);

      try {
        const data = await fetchWithRetry(url);

        // Transform from spa5k format to our format
        // Source: { ayahs: [{ ayah, surah, text }] }
        const verses = (data.ayahs || []).map((a) => ({
          verseKey: `${a.surah}:${a.ayah}`,
          text: a.text,
        }));

        const surahJson = { verses };
        writeFileSync(filePath, JSON.stringify(surahJson), "utf-8");
        surahsDownloaded++;

        if (surahId % 20 === 0 || surahId === 114) {
          console.log(`  ${padNumber(surahId)}/114 surahs downloaded`);
        }
      } catch (err) {
        console.error(`  FAILED surah ${surahId}: ${err.message}`);
      }

      await sleep(DELAY_MS);
    }

    if (surahsDownloaded === 114) {
      indexEntries.push({
        id: tafsirId,
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
  console.log(`Tafsirs: ${indexEntries.length} complete`);
  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
