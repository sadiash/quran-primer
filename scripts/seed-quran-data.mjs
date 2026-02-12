/**
 * Seed Quran Data Script
 *
 * Fetches all 114 surahs with Arabic text from the Quran.com API v4
 * and saves them as individual JSON files.
 *
 * Usage: node scripts/seed-quran-data.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_BASE = "https://api.quran.com/api/v4";
const SURAHS_DIR = join(
  new URL(".", import.meta.url).pathname,
  "..",
  "data",
  "quran",
  "surahs"
);
const METADATA_PATH = join(SURAHS_DIR, "..", "metadata.json");
const DELAY_MS = 200; // delay between requests
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 1000; // initial backoff; doubles each retry

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry and exponential backoff.
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} – ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const backoff = RETRY_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.warn(
          `  [retry ${attempt}/${retries}] ${err.message} — waiting ${backoff}ms`
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
  // Ensure output directories exist
  if (!existsSync(SURAHS_DIR)) {
    mkdirSync(SURAHS_DIR, { recursive: true });
    console.log(`Created directory: ${SURAHS_DIR}`);
  }

  // 1. Fetch surah metadata ------------------------------------------------
  console.log("Fetching surah metadata from API...");
  const chaptersData = await fetchWithRetry(`${API_BASE}/chapters?language=en`);
  const chapters = chaptersData.chapters; // array of 114 surahs

  if (!chapters || chapters.length === 0) {
    throw new Error("No chapters returned from the API.");
  }
  console.log(`Received metadata for ${chapters.length} surahs.\n`);

  // Build metadata array (no verses)
  const metadata = chapters.map((ch) => ({
    id: ch.id,
    nameArabic: ch.name_arabic,
    nameSimple: ch.name_simple,
    nameComplex: ch.name_complex,
    nameTranslation: ch.translated_name?.name ?? "",
    revelationType: ch.revelation_place,
    versesCount: ch.verses_count,
  }));

  // Save metadata index file
  writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2), "utf-8");
  console.log(`Saved metadata index -> ${METADATA_PATH}\n`);

  // 2. Fetch verses for each surah -----------------------------------------
  const totalSurahs = chapters.length;

  for (let i = 0; i < totalSurahs; i++) {
    const ch = chapters[i];
    const chapterId = ch.id;
    const fileName = `${padNumber(chapterId)}.json`;
    const filePath = join(SURAHS_DIR, fileName);

    console.log(
      `[${padNumber(chapterId)}/${padNumber(totalSurahs)}] Fetching ${ch.name_simple} (${ch.name_arabic}) — ${ch.verses_count} verses...`
    );

    // Fetch all verses for this chapter (per_page=300 covers the longest surah, Al-Baqarah at 286)
    const versesUrl = `${API_BASE}/verses/by_chapter/${chapterId}?language=en&words=false&fields=text_uthmani,text_imlaei,verse_key&per_page=300`;

    let versesData;
    try {
      versesData = await fetchWithRetry(versesUrl);
    } catch (err) {
      console.error(
        `  FAILED to fetch surah ${chapterId} after ${MAX_RETRIES} retries: ${err.message}`
      );
      console.error("  Skipping this surah.");
      continue;
    }

    const verses = (versesData.verses || []).map((v) => ({
      id: v.id,
      verseKey: v.verse_key,
      verseNumber: v.verse_number,
      textUthmani: v.text_uthmani,
      textSimple: v.text_imlaei,
    }));

    // Build surah JSON
    const surahJson = {
      id: ch.id,
      nameArabic: ch.name_arabic,
      nameSimple: ch.name_simple,
      nameComplex: ch.name_complex,
      nameTranslation: ch.translated_name?.name ?? "",
      revelationType: ch.revelation_place,
      versesCount: ch.verses_count,
      verses,
    };

    writeFileSync(filePath, JSON.stringify(surahJson, null, 2), "utf-8");
    console.log(
      `  Saved ${fileName} (${verses.length} verses)`
    );

    // Rate-limit: wait before the next request (skip delay after the last one)
    if (i < totalSurahs - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log("\nDone! All surahs have been fetched and saved.");
  console.log(`  Surah files : ${SURAHS_DIR}`);
  console.log(`  Metadata    : ${METADATA_PATH}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
