/**
 * Seed Hadith Script
 *
 * Downloads hadith collections from AhmedBaset/hadith-json GitHub repository
 * and saves them as per-chapter JSON files.
 *
 * Usage: node scripts/seed-hadith.mjs
 *
 * Source: https://github.com/AhmedBaset/hadith-json (JSON)
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const RAW_BASE =
  "https://raw.githubusercontent.com/AhmedBaset/hadith-json/main/db";

const DATA_DIR = join(
  new URL(".", import.meta.url).pathname,
  "..",
  "data",
  "hadith",
);

const DELAY_MS = 200;
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 1000;

/**
 * Target collections. We use per-chapter files from by_chapter/the_9_books/.
 * maxChapters: approximate upper bound for chapter numbers to try.
 */
const COLLECTIONS = [
  {
    slug: "bukhari",
    name: "Sahih al-Bukhari",
    maxChapters: 97,
  },
  {
    slug: "muslim",
    name: "Sahih Muslim",
    maxChapters: 56,
  },
  {
    slug: "abudawud",
    name: "Sunan Abu Dawud",
    maxChapters: 43,
  },
  {
    slug: "tirmidhi",
    name: "Jami at-Tirmidhi",
    maxChapters: 49,
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
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  const indexEntries = [];

  for (const collection of COLLECTIONS) {
    const collectionDir = join(DATA_DIR, collection.slug);
    if (!existsSync(collectionDir)) {
      mkdirSync(collectionDir, { recursive: true });
    }

    console.log(`\n--- ${collection.name} (${collection.slug}) ---`);

    let chaptersDownloaded = 0;
    let totalHadiths = 0;
    let consecutiveFailures = 0;

    for (let chapter = 1; chapter <= collection.maxChapters; chapter++) {
      const url = `${RAW_BASE}/by_chapter/the_9_books/${collection.slug}/${chapter}.json`;
      const fileName = `${padNumber(chapter)}.json`;
      const filePath = join(collectionDir, fileName);

      try {
        const data = await fetchWithRetry(url);

        // Transform to our format
        const hadiths = (data.hadiths || []).map((h) => ({
          id: h.id,
          hadithNumber: String(h.idInBook || h.id),
          text: h.english?.text || "",
          grade: null,
          narratedBy: h.english?.narrator || null,
        }));

        const chapterJson = {
          collection: collection.slug,
          collectionName: collection.name,
          book: chapter,
          bookName: data.chapter?.english || `Book ${chapter}`,
          hadiths,
        };

        writeFileSync(filePath, JSON.stringify(chapterJson), "utf-8");
        chaptersDownloaded++;
        totalHadiths += hadiths.length;
        consecutiveFailures = 0;

        if (chapter % 10 === 0) {
          console.log(
            `  Chapter ${padNumber(chapter)}/${padNumber(collection.maxChapters)} — ${totalHadiths} hadiths so far`,
          );
        }
      } catch (err) {
        consecutiveFailures++;
        // If we get 3 consecutive 404s, assume we've reached the end
        if (consecutiveFailures >= 3) {
          console.log(
            `  Reached end of collection at chapter ${chapter} (3 consecutive failures)`,
          );
          break;
        }
        console.warn(`  Chapter ${chapter}: ${err.message}`);
      }

      await sleep(DELAY_MS);
    }

    indexEntries.push({
      id: collection.slug,
      name: collection.name,
      hadithCount: totalHadiths,
      chapterCount: chaptersDownloaded,
    });

    console.log(
      `  Complete: ${chaptersDownloaded} chapters, ${totalHadiths} hadiths`,
    );
  }

  // Write index.json
  const indexPath = join(DATA_DIR, "index.json");
  writeFileSync(indexPath, JSON.stringify(indexEntries, null, 2), "utf-8");
  console.log(`\nSaved index: ${indexPath}`);
  console.log(
    `Collections: ${indexEntries.length}, Total hadiths: ${indexEntries.reduce((sum, c) => sum + c.hadithCount, 0)}`,
  );
  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
